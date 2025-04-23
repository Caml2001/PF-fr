
### 🧠 Instrucciones globales para generación de backend desde frontend


# Instrucciones para la generación de backend desde frontend (modo Windsurf)

## Contexto del proyecto
Este proyecto es un **micro-lender** digital que ofrece créditos de consumo de bajo monto (500–5,000 MXN) con flujos 100% digitales. Este es el frontend.

El backend aún no está construido, así que estas instrucciones permiten que cada componente declare explícitamente lo que necesita del backend (inputs, outputs, endpoints, validaciones).

---

## Instrucciones para recorrer cada archivo frontend (especialmente componentes, hooks, pages y secciones):

1. **Detecta la intención del componente:**
   - ¿Qué flujo cubre? ¿Login, onboarding, solicitud de crédito, subida de documentos?

2. **Enumera los endpoints que necesita**:
   - Por cada acción en el componente, define un endpoint REST como `POST /api/credit/application-submit`
   - Usa solo HTTP methods estándar (`GET`, `POST`, `PATCH`, `DELETE`)

3. **Especifica claramente:**
   - **Payload enviado** (con tipos y validaciones)
   - **Respuesta esperada**
   - **Errores posibles** (por ejemplo: 401, 422, 409)
   - **Dependencias previas** (por ejemplo: usuario debe haber iniciado sesión, debe haber dado consentimiento al buró)

4. **Agrega ejemplos de JSON:**
   - Tanto de request como de response, con datos dummy pero realistas

5. **Opcional: Sugiere estructura en base de datos**:
   - Si el componente depende de una entidad (ej. préstamo), sugiere cómo podría verse su modelo

---

## Formato de salida esperado
Crea un archivo `.md` en la carpeta correspondiente de `documentation/backend-requests/` siguiendo esta estructura:


# POST /api/credit/application-submit

### Descripción
...

### Payload
```json
...

### Response
```json
...

### Validaciones
...

### Errores posibles
...

---

## Consideraciones técnicas
- El backend será probablemente desarrollado en Node.js con Express o Fastify
- Las respuestas deben ser tipadas (TypeScript friendly)
- El sistema debe poder crecer hacia una arquitectura de microservicios

---

## Prioridades actuales (MVP)
1. Autenticación: login/signup
2. Flujo de buró de crédito (consentimiento, consulta)
3. Solicitud de crédito
4. Subida de documentos (INE, comprobante domicilio)
5. Generación y consulta de cronograma de pagos
6. Registro de pagos

---
