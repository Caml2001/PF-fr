# POST /api/auth/logout

### Descripción
Cierra la sesión del usuario (invalida el token en backend si aplica).

### Payload
N/A (requiere header Authorization: Bearer <token>)

### Response
```json
{
  "success": true
}
```

### Validaciones
- Token válido

### Errores posibles
- 401: Token inválido o expirado

### Dependencias previas
Usuario debe haber iniciado sesión
