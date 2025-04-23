# GET /api/credit/application-status

### Descripción
Devuelve el estado actual de la solicitud de crédito del usuario.

### Payload
N/A (requiere autenticación y, opcionalmente, parámetro de applicationId)

#### Ejemplo de request (por query string):
`GET /api/credit/application-status?applicationId=uuid`

### Response
```json
{
  "applicationId": "uuid",
  "status": "preapproved",
  "commission": 37.5,
  "amountToReceive": 2462.5,
  "deadlineDate": "2025-04-28",
  "message": "Solicitud preaprobada. Falta revisión final."
}
```

### Validaciones
- Usuario autenticado
- applicationId válido y perteneciente al usuario

### Errores posibles
- 401: Usuario no autenticado
- 404: Solicitud no encontrada

### Dependencias previas
Debe existir una solicitud de crédito activa
