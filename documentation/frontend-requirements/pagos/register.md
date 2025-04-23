# POST /api/payments/register

### Descripción
Registra un pago realizado por el usuario para un crédito activo.

### Payload
```json
{
  "userId": "uuid",
  "applicationId": "uuid",
  "amount": 1500,
  "paymentDate": "2025-05-01",
  "paymentMethod": "transferencia"
}
```

### Response
```json
{
  "paymentId": "uuid",
  "status": "registered",
  "appliedAmount": 1500,
  "remainingBalance": 1000,
  "message": "Pago registrado correctamente."
}
```

### Validaciones
- userId válido y autenticado
- applicationId válido y pertenece al usuario
- Monto positivo y menor o igual al saldo pendiente
- Fecha válida

### Errores posibles
- 401: Usuario no autenticado
- 404: Solicitud de crédito no encontrada
- 422: Datos de pago inválidos

### Dependencias previas
Debe existir una solicitud de crédito activa

### Ejemplo de modelo de pago
```ts
{
  id: string;
  userId: string;
  applicationId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'registered' | 'rejected';
  createdAt: string;
}
```
