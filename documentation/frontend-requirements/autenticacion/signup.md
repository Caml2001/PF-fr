# POST /api/auth/signup

### Descripción
Crea una nueva cuenta de usuario. Recibe datos de registro y devuelve el usuario autenticado y un token de sesión.

### Payload
```json
{
  "email": "usuario@ejemplo.com",
  "password": "stringMin8chars",
  "name": "Juan Pérez"
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
- Email válido y único
- Password mínimo 8 caracteres
- Name no vacío

### Errores posibles
- 409: Email ya registrado
- 422: Datos inválidos

### Dependencias previas
Ninguna

### Ejemplo de modelo de usuario
```ts
{
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}
```
