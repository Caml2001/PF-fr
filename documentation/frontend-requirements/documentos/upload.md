# POST /api/documents/upload

### Descripción
Permite subir documentos requeridos (INE, comprobante de domicilio) para la solicitud de crédito. Devuelve la URL de acceso al documento almacenado.

### Payload
Multipart/form-data con los siguientes campos:
- `userId` (string, requerido)
- `type` ("ine" | "address", requerido)
- `file` (archivo, requerido)

#### Ejemplo de request
```
POST /api/documents/upload
Content-Type: multipart/form-data

userId=uuid
type=ine
file=<archivo adjunto>
```

### Response
```json
{
  "documentUrl": "https://docs/ine/uuid.jpg",
  "type": "ine"
}
```

### Validaciones
- userId válido y autenticado
- type válido ("ine" o "address")
- Archivo presente y tipo soportado (jpg, png, pdf)

### Errores posibles
- 401: Usuario no autenticado
- 422: Archivo o tipo inválido

### Dependencias previas
Usuario debe haber iniciado sesión

### Ejemplo de modelo de documento
```ts
{
  id: string;
  userId: string;
  type: 'ine' | 'address';
  url: string;
  uploadedAt: string;
}
```
