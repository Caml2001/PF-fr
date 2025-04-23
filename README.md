# PrestaFirme

Sistema MVP para microcréditos digitales.

---

## Descripción
PrestaFirme es una plataforma modular para originación, gestión y cobranza de micropréstamos 100% digitales, orientada a usuarios en México. El proyecto está diseñado como un monorepo escalable, con separación clara entre frontend, backend y paquetes compartidos.

---

## Estructura del repositorio

```
mini-lender/
├─ apps/
│  ├─ api/                # Backend REST/GraphQL
│  ├─ bot/                # Webhook de WhatsApp + orquestación LLM
│  ├─ jobs/               # Workers (recordatorios, conciliaciones)
│  └─ edge-functions/     # Supabase Edge Functions
├─ packages/
│  ├─ db/                 # Modelos y acceso a base de datos
│  ├─ shared/             # Utilidades compartidas (logger, SDKs)
│  └─ config/             # Tipos y configuración de entorno
├─ infra/                 # Infraestructura y migraciones
└─ turbo.json / nx.json   # Pipeline de build, lint, test
```

---

## Principales flujos y endpoints

- **Autenticación:** Signup, login, logout, JWT, social login.
- **Onboarding:** Captura de datos, documentos, consentimiento buró.
- **Buró de crédito:** Consentimiento y consulta.
- **Solicitud de crédito:** Alta, estatus, cálculo de comisión y monto a recibir.
- **Documentos:** Subida y consulta de INE/comprobante domicilio.
- **Pagos:** Registro, historial y cronograma de pagos.

Consulta la documentación detallada en:
- `/documentation/backend-structure/README.md`: Modelo de base de datos y arquitectura.
- `/documentation/frontend-requirements/`: Requerimientos y flujos frontend.

---

## Tecnologías principales
- **Frontend:** React + TypeScript
- **Backend:** Node.js (Express/Fastify), Supabase (Postgres, Auth, Storage)
- **Infraestructura:** Docker, Terraform, Supabase CLI
- **Monorepo:** PNPM Workspaces, Turbo/NX

---

## Desarrollo y despliegue
1. Clona el repositorio y ejecuta `pnpm install` en la raíz.
2. Configura las variables de entorno en `/packages/config` y `.env`.
3. Usa los comandos de Turbo/NX para desarrollo y build.
4. Despliegue recomendado: Supabase + Vercel/Fly.io.

---

## Colaboradores
- Carlos Martínez López (@Caml2001) y equipo.

---

## Licencia
MIT
