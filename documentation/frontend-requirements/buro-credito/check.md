# POST /api/credit-bureau/check

### Descripción
Realiza la consulta del buró de crédito del usuario y devuelve el resultado (aprobatorio o no, score, resumen, etc).

### Payload
```json
{
  "userId": "uuid"
}
```

### Response
```json
{
  "result": "approved",
  "score": 720,
  "summary": "Sin adeudos relevantes. Historial positivo.",
  "details": {
    "openCredits": 2,
    "latePayments": 0,
    "maxDelayDays": 0
  },
  "checkedAt": "2025-04-23T14:10:00Z"
}
```

### Validaciones
- userId válido y autenticado
- Consentimiento otorgado previamente

### Errores posibles
- 401: Usuario no autenticado
- 403: Consentimiento no otorgado
- 422: userId inválido

### Dependencias previas
Usuario debe haber otorgado consentimiento

### Ejemplo de modelo de resultado buró
```ts
{
  id: string;
  userId: string;
  result: 'approved' | 'rejected';
  score: number;
  summary: string;
  details: {
    openCredits: number;
    latePayments: number;
    maxDelayDays: number;
  };
  checkedAt: string;
}
```
