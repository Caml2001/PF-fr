# GET /api/documents/:type

### Descripción
Devuelve la URL y metadatos del documento subido por el usuario (INE o comprobante de domicilio).

### Payload
N/A (requiere autenticación y parámetro `type` en la ruta: "ine" o "address")

#### Ejemplo de request:
`GET /api/documents/ine`

### Response
```json
{
  "documentUrl": "https://docs/ine/uuid.jpg",
  "type": "ine",
  "uploadedAt": "2025-04-23T14:00:00Z"
}
```

### Validaciones
- Usuario autenticado
- type válido ("ine" o "address")

### Errores posibles
- 401: Usuario no autenticado
- 404: Documento no encontrado

### Dependencias previas
Documento debe haber sido subido previamente
