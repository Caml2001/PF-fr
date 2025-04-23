# GET /api/payments/history

### Descripción
Devuelve el historial de pagos realizados por el usuario para una solicitud de crédito específica o para todas.

### Payload
N/A (requiere autenticación y, opcionalmente, parámetro de applicationId)

#### Ejemplo de request (por query string):
`GET /api/payments/history?applicationId=uuid`

### Response
```json
{
  "payments": [
    {
      "paymentId": "uuid1",
      "amount": 1500,
      "paymentDate": "2025-05-01",
      "paymentMethod": "transferencia",
      "status": "registered"
    },
    {
      "paymentId": "uuid2",
      "amount": 1000,
      "paymentDate": "2025-05-15",
      "paymentMethod": "tarjeta",
      "status": "registered"
    }
  ]
}
```

### Validaciones
- Usuario autenticado
- applicationId válido si se provee

### Errores posibles
- 401: Usuario no autenticado
- 404: Solicitud de crédito no encontrada

### Dependencias previas
Debe existir una solicitud de crédito y/o pagos registrados
