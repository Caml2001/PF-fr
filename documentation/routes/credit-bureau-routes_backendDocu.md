# Documentación de Rutas de Buró de Crédito para Administrador

Esta documentación detalla los endpoints relacionados con el buró de crédito disponibles en el sistema para los administradores. Estos endpoints permiten consultar los reportes de buró de crédito de los usuarios.

## Consideraciones Generales

- Todos los endpoints requieren autenticación con un token JWT válido y el usuario debe tener rol de administrador.
- Las respuestas siguen un formato JSON estándar.
- La URL base puede incluir un prefijo (por ejemplo, `/api`) según la configuración del servidor.

## Endpoints para Reportes de Buró de Crédito

### 1. Obtener todos los reportes de crédito
- **Método**: `GET`
- **URL**: `/admin/credit-bureau`
- **Descripción**: Recupera una lista paginada de todos los reportes de buró de crédito, con datos básicos del perfil asociado.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Consulta**:
  - `limit` (opcional, numérico): Número máximo de reportes a devolver (valor predeterminado: 20).
  - `offset` (opcional, numérico): Número de reportes a omitir (para paginación, valor predeterminado: 0).
  - `profileId` (opcional, string): Filtrar por ID de perfil específico.
- **Respuestas**:
  - `200 OK`: Lista de reportes obtenida con éxito.
    - **Cuerpo**: 
      ```json
      {
        "reports": [
          {
            "id": "uuid",
            "profileId": "uuid",
            "firstName": "string",
            "lastName": "string",
            "motherLastName": "string",
            "email": "string",
            "phone": "string",
            "folioConsulta": "string",
            "fechaConsulta": "string (ISO date)",
            "fuente": "string",
            "scoreValor": 123,
            "scoreRango": "string",
            "createdAt": "string (ISO date)"
          },
          ...
        ],
        "total": 123,
        "limit": 20,
        "offset": 0
      }
      ```
  - `401 Unauthorized`: Token no proporcionado o inválido.
  - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
  - `500 Internal Server Error`: Error al consultar la base de datos.

### 2. Obtener un reporte específico por ID
- **Método**: `GET`
- **URL**: `/admin/credit-bureau/{id}`
- **Descripción**: Recupera un reporte de buró de crédito específico por su ID, incluyendo todos los detalles del reporte.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Ruta**:
  - `id` (obligatorio, string): ID del reporte a consultar.
- **Respuestas**:
  - `200 OK`: Reporte encontrado y devuelto con éxito.
    - **Cuerpo**: 
      ```json
      {
        "report": {
          "id": "uuid",
          "profileId": "uuid",
          "folioConsulta": "string",
          "fechaConsulta": "string (ISO date)",
          "fuente": "string",
          "personaNombreCompleto": "string",
          "personaRfc": "string",
          "personaFechaNacimiento": "string (YYYY-MM-DD)",
          "personaDomicilio": { "objeto con datos de domicilio" },
          "scoreValor": 123,
          "scoreRango": "string",
          "creditosDetalle": [ "array con detalles de créditos" ],
          "rawResponse": { "objeto con respuesta completa del buró" },
          "createdAt": "string (ISO date)",
          "updatedAt": "string (ISO date)"
        }
      }
      ```
  - `401 Unauthorized`: Token no proporcionado o inválido.
  - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
  - `404 Not Found`: Reporte no encontrado.
  - `500 Internal Server Error`: Error al consultar la base de datos.

### 3. Obtener todos los reportes de un perfil específico
- **Método**: `GET`
- **URL**: `/admin/credit-bureau/by-profile/{profileId}`
- **Descripción**: Recupera todos los reportes de buró de crédito asociados a un perfil específico.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Ruta**:
  - `profileId` (obligatorio, string): ID del perfil cuyos reportes se desean consultar.
- **Parámetros de Consulta**:
  - `limit` (opcional, numérico): Número máximo de reportes a devolver (valor predeterminado: 20).
  - `offset` (opcional, numérico): Número de reportes a omitir (para paginación, valor predeterminado: 0).
- **Respuestas**:
  - `200 OK`: Lista de reportes obtenida con éxito.
    - **Cuerpo**: 
      ```json
      {
        "reports": [
          {
            "id": "uuid",
            "profileId": "uuid",
            "folioConsulta": "string",
            "fechaConsulta": "string (ISO date)",
            "fuente": "string",
            "personaNombreCompleto": "string",
            "personaRfc": "string",
            "personaFechaNacimiento": "string (YYYY-MM-DD)",
            "personaDomicilio": { "objeto con datos de domicilio" },
            "scoreValor": 123,
            "scoreRango": "string",
            "creditosDetalle": [ "array con detalles de créditos" ],
            "rawResponse": { "objeto con respuesta completa del buró" },
            "createdAt": "string (ISO date)",
            "updatedAt": "string (ISO date)"
          },
          ...
        ],
        "total": 123,
        "limit": 20,
        "offset": 0
      }
      ```
  - `401 Unauthorized`: Token no proporcionado o inválido.
  - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
  - `404 Not Found`: Perfil no encontrado.
  - `500 Internal Server Error`: Error al consultar la base de datos.

## Schemas Utilizados

### CreditReportSchema
Define la estructura básica de un reporte de buró de crédito.
- **Campos**:
  - `id` (string): Identificador único del reporte.
  - `profileId` (string): Identificador del perfil asociado.
  - `folioConsulta` (string, opcional): Folio de la consulta al buró.
  - `fechaConsulta` (string, fecha ISO): Fecha y hora de la consulta.
  - `fuente` (string): Fuente del reporte (por ejemplo, "DUMMY_BUREAU").
  - `personaNombreCompleto` (string, opcional): Nombre completo de la persona.
  - `personaRfc` (string, opcional): RFC de la persona.
  - `personaFechaNacimiento` (string, opcional): Fecha de nacimiento en formato "YYYY-MM-DD".
  - `scoreValor` (número, opcional): Valor numérico del score crediticio.
  - `scoreRango` (string, opcional): Clasificación del score (por ejemplo, "BUENO", "REGULAR", "MALO").
  - `createdAt` (string, fecha ISO): Fecha de creación del registro.
  - `updatedAt` (string, fecha ISO): Fecha de última actualización.

### CreditReportWithProfileSchema
Define la estructura de un reporte de buró de crédito con datos básicos del perfil.
- **Campos**:
  - `id` (string): Identificador único del reporte.
  - `profileId` (string): Identificador del perfil asociado.
  - `firstName` (string, opcional): Nombre del usuario.
  - `lastName` (string, opcional): Apellido paterno del usuario.
  - `motherLastName` (string, opcional): Apellido materno del usuario.
  - `email` (string, opcional): Correo electrónico del usuario.
  - `phone` (string, opcional): Teléfono del usuario.
  - `folioConsulta` (string, opcional): Folio de la consulta al buró.
  - `fechaConsulta` (string, fecha ISO): Fecha y hora de la consulta.
  - `fuente` (string): Fuente del reporte.
  - `scoreValor` (número, opcional): Valor numérico del score crediticio.
  - `scoreRango` (string, opcional): Clasificación del score.
  - `createdAt` (string, fecha ISO): Fecha de creación del registro.