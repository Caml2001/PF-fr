# GET /api/auth/me

### Descripción
Devuelve la información del usuario autenticado.

### Payload
N/A (requiere header Authorization: Bearer <token>)

### Response
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez"
  }
}
```

### Validaciones
- Token válido

### Errores posibles
- 401: Token inválido o expirado

### Dependencias previas
Usuario debe haber iniciado sesión
