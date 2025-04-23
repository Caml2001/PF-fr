### 1. Base de datos (Supabase Postgres)

| Entidad | Campos clave | Relación / propósito |
|---------|--------------|----------------------|
| **auth.users** | (manejada por Supabase Auth) | Autenticación JWT y social/OAuth. |
| **profiles** | `id PK → auth.users.id`, `name`, `phone`, `created_at` | Datos públicos del usuario. |
| **bureau_consent** | `user_id FK`, `consented_at`, `ip`, `source` | Evidencia (“click-wrap”) para el buró. |
| **bureau_reports** | `id PK`, `user_id FK`, `score`, `raw_json`, `checked_at` | Guarda la respuesta del buró (puedes cifrar `raw_json`). |
| **credit_applications** | `id PK`, `user_id FK`, `amount`, `payment_term_days`, `status`, `commission`, `preapproved_score`, `created_at` | Solicitud inicial. |
| **loans** | `id PK`, `application_id FK`, `principal`, `issued_at`, `maturity_at`, `next_due`, `outstanding`, `status` | Se crea sólo al aprobar. |
| **repayments** | `id PK`, `loan_id FK`, `due_date`, `amount`, `status`, `paid_at` | Calendario de pagos. |
| **payments** | `id PK`, `loan_id FK`, `repayment_id FK`, `amount`, `method`, `tx_ref`, `received_at`, `status` | Registro de cobros manuales o automáticos. |
| **documents** | `id PK`, `user_id FK`, `type` (“ine”, “address”), `storage_path`, `uploaded_at` | Se almacena en **Supabase Storage**. |
| **chat_sessions** | `id PK`, `user_id FK`, `channel` (“whatsapp”), `started_at` | Conversación con el bot. |
| **chat_messages** | `id PK`, `session_id FK`, `role` (“user”/“assistant”), `content`, `media_url`, `provider_msg_id`, `created_at` | Historial para el LLM / auditoría. |
| **webhook_logs** | `id PK`, `source`, `raw_body`, `headers`, `received_at` | Traza de todos los webhooks (Twilio, OpenRouter callbacks, etc.). |

*Row-level security (RLS)*: política “user → their rows”.  
*Índices* sugeridos: `credit_applications(user_id, created_at DESC)`, `loans(status, next_due)`, `payments(repayment_id)`.

---

### 2. Arquitectura del repo (monorepo PNPM workspaces)

```
mini-lender/
├─ apps/
│  ├─ api/                # REST/GraphQL – expone los endpoints del README citeturn0file0
│  ├─ bot/                # Webhook de Twilio + orquestación LLM
│  ├─ jobs/               # Workers (queues) p.ej. recordatorios de pago, conciliaciones
│  └─ edge-functions/     # Supabase Edge Functions (buró, firma pagaré, etc.)
├─ packages/
│  ├─ db/                 # Prisma schema o drizzle + zod models
│  ├─ shared/             # Utils (LLM client, Twilio SDK wrapper, logger)
│  └─ config/             # Tipos env y carga de variables
├─ infra/                 # Docker compose, Terraform, Supabase migrations
└─ turbo.json / nx.json   # Pipeline de build, lint, test
```

**Por qué un monorepo modular?**  
- **Sencillo ahora** (un único repo, deploy vía Supabase Functions + Fly/Vercel).  
- **Escalable mañana**: cada app es independiente; basta desacoplarla a un microservicio y apuntar al mismo Postgres.

---

### 3. Flujo “chatbot” (WhatsApp ↔ Twilio ↔ OpenRouter/OpenAI)

1. **Webhook** `POST /bot/webhook` (apps/bot):  
   - Verifica firma Twilio, extrae `From`, `Body`, `MediaUrl`, `MediaType`.
   - Persiste en `chat_messages (role="user")`.
2. **Procesamiento**  
   - Si `MediaType` = audio → **Whisper (STT)**.  
   - Si imagen (INE) → **OpenAI Vision** (extracción OCR, validaciones).  
   - Llama a **OpenRouter** (`/chat/completions`) con contexto (últimos N mensajes + estado del usuario/loan).  
3. **Respuesta**  
   - Guarda mensaje assistant en `chat_messages`.  
   - Envía `POST /Messages` a Twilio API (WhatsApp).  
4. **Side-effects** (en **jobs**): generar links de pago, crear solicitud, recordatorios.

---

### 4. Edge Functions (Supabase)

| Ruta | Propósito |
|------|-----------|
| `/credit-application` | `POST` crea solicitud - usa RLS + verificación JWT. |
| `/credit-bureau/check` | Llama al proveedor, guarda `bureau_reports`, retorna score. |
| `/loans/:id/schedule` | Devuelve cronograma (join loans + repayments). |
| `/twilio/status` | Callback de estado de mensaje/pago (actualiza `payments`). |

Ventaja: se ejecutan “near-db” y pueden usar **row-level** sin exponer credenciales.

---

### 5. Escalabilidad “sin sobresaltos”

| Ahora (MVP) | Cuando crezcas |
|-------------|----------------|
| **Single Postgres (Supabase)** | Read replicas o Supabase Enterprise. |
| **API y Bot en un sólo container** | Separar **bot** (I/O bound) y **api** (CPU/DB bound). |
| **BullMQ en jobs/** con Redis lite | Sube a Upstash Redis Cluster. |
| **Edge Functions** | Migra los heavy-ones a Fastify service detrás de API Gateway. |
| **Twilio webhook público** | Añade Cloudflare Zero-Trust + verify tokens. |

---

### 6. Stack recomendada

| Capa | Tech | Motivo |
|------|------|--------|
| Runtime | **Node 18 + TS** | Familiar, gran ecosistema. |
| Framework API | **Fastify** · zod · tRPC | Liviano, tip-safe, fácil serverless. |
| ORM | **Drizzle ORM** | SQL first, migraciones generadas, funciona en Edge. |
| Auth | **Supabase Auth** | Gestión JWT + RLS gratis. |
| Queues | **BullMQ / Redis** | Simple, re-intentos. |
| Storage | **Supabase Storage** | Cierra círculo con RLS. |
| Observability | **OpenTelemetry + Sentry** | Una línea en Fastify, dashboard claro. |

---

### 7. Variables de entorno (ejemplo)

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+52155XXXX
OPENROUTER_API_KEY=...
OPENAI_API_KEY=...
REDIS_URL=...
```

---

### 8. Ruta de deploy

1. **Infra**: `infra/docker-compose.yml` (db + redis + localstack).  
2. **CI/CD**: GitHub Actions →  
   - Lint & test.  
   - `supabase db push` (migraciones).  
   - Deploy Edge Functions (`supabase functions deploy`).  
   - Build `api/` & `bot/` images → Fly.io or Railway.  
3. **Rollback**: versión anterior del container + `supabase db revert <hash>`.

---
