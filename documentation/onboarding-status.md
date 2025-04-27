# Endpoint: `/onboarding/status`

Consulta el estatus actual de onboarding y los datos capturados del usuario. Ideal para mostrar el progreso y los datos ya ingresados en el frontend.

---

## Método

```
GET /onboarding/status
```

### Autenticación
- **Requiere JWT Bearer Token**, ya en el axios

---

## Respuesta exitosa (`200 OK`)

```json
{
  "status": "PROFILE_PENDING", // Estatus actual del onboarding
  "details": {
    "lastUpdated": "2025-04-27T09:12:01.000Z", // Última actualización del perfil
    "profile": {
      "phoneNumber": "+521234567890",
      "phoneVerified": true,
      "ineFrontUrl": "https://...",
      "curp": "MALC...",
      "firstName": "Carlos",
      "lastName": "Martinez",
      "onboardingStatus": "PROFILE_PENDING",
      // ...otros campos relevantes del perfil
    },
    "tempOnboarding": {
      "firstName": "Carlos",
      "lastName": "Martinez",
      "birthDate": "2001-08-30",
      // ...otros campos temporales capturados
    }
  }
}
```

---

## Campos devueltos

- **status**: Estatus actual del onboarding (`PHONE_PENDING`, `OTP_PENDING`, `PROFILE_PENDING`, `INE_SUBMITTED`, etc.)
- **details.lastUpdated**: Fecha/hora de la última actualización del perfil.
- **details.profile**: Objeto con los datos definitivos guardados en el perfil. Útil para mostrar qué pasos ya están completos.
- **details.tempOnboarding**: Objeto con los datos temporales de onboarding (si existen). Útil para mostrar datos que aún no se han consolidado en el perfil principal.

---

## Ejemplo de error (`404`)

```json
{
  "status": "NOT_FOUND"
}
```

---

## Notas
- El frontend puede usar `profile` y `tempOnboarding` para mostrar el avance, prellenar formularios o indicar qué pasos faltan.
- El campo `status` es la fuente de verdad para el flujo de onboarding.
- Si necesitas más campos, se pueden agregar fácilmente.

---

¿Dudas o necesitas otro ejemplo? ¡Avísame!
