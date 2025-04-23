# POST /api/auth/login

### Descripción
Autentica a un usuario existente. Devuelve el usuario y un token de sesión.

### Payload
```json
{
  "email": "usuario@ejemplo.com",
  "password": "stringMin8chars"
}
```

### Response
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez"
  },
  "token": "jwt-token"
}
```

### Validaciones
- Email y password obligatorios

### Errores posibles
- 401: Credenciales incorrectas
- 422: Datos inválidos

### Dependencias previas
Usuario debe estar registrado
