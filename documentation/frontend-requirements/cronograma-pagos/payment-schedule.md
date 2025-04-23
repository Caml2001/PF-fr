# GET /api/credit/payment-schedule

### Descripción
Devuelve el cronograma de pagos (fechas, montos, estatus) para una solicitud de crédito específica.

### Payload
N/A (requiere autenticación y parámetro applicationId)

#### Ejemplo de request (por query string):
`GET /api/credit/payment-schedule?applicationId=uuid`

### Response
```json
{
  "applicationId": "uuid",
  "schedule": [
    {
      "dueDate": "2025-05-01",
      "amount": 1000,
      "status": "paid"
    },
    {
      "dueDate": "2025-05-15",
      "amount": 1500,
      "status": "pending"
    }
  ]
}
```

### Validaciones
- Usuario autenticado
- applicationId válido y pertenece al usuario

### Errores posibles
- 401: Usuario no autenticado
- 404: Solicitud de crédito no encontrada

### Dependencias previas
Debe existir una solicitud de crédito activa

### Ejemplo de modelo de cronograma
```ts
{
  id: string;
  applicationId: string;
  schedule: Array<{
    dueDate: string;
    amount: number;
    status: 'paid' | 'pending' | 'late';
  }>;
}
```
