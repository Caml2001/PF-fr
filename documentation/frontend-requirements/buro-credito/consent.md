# POST /api/credit-bureau/consent

### Descripción
Registra el consentimiento explícito del usuario para consultar su buró de crédito.

### Payload
```json
{
  "userId": "uuid",
  "consent": true
}
```

### Response
```json
{
  "success": true,
  "timestamp": "2025-04-23T14:00:00Z"
}
```

### Validaciones
- userId válido y autenticado
- Consentimiento explícito (true)

### Errores posibles
- 401: Usuario no autenticado
- 409: Consentimiento ya otorgado previamente

### Dependencias previas
Usuario debe haber iniciado sesión

### Ejemplo de modelo de consentimiento
```ts
{
  id: string;
  userId: string;
  consent: boolean;
  consentTimestamp: string;
}
```
