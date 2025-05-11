# Documentación Detallada del Servicio: Onboarding

Este documento detalla cada uno de los endpoints gestionados por el servicio de Onboarding (`onboarding.ts`). Está diseñado para servir como referencia técnica exhaustiva tanto para el equipo de backend como para el equipo de frontend.

## Endpoints

### 1. Completar Perfil y Registrar Consentimiento al Buró de Crédito
- **Método**: `POST`
- **URL**: `/onboarding/complete`
- **Descripción General**: Verifica que el perfil del usuario esté completo, registra su consentimiento para la consulta al buró de crédito, y si consiente, realiza la consulta simulada al buró inmediatamente.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Onboarding`
- **Cuerpo de la Solicitud (`application/json`)**: `CompleteOnboardingSchema`
    - *Ejemplo*:
      ```json
      {
        "consentToBureauCheck": true  // o false
      }
      ```
- **Respuestas**:
    - `200 OK`: Perfil validado y consentimiento registrado.
        - **Cuerpo**:
          ```json
          {
            "success": true,
            "message": "Decisión sobre consulta al Buró registrada y perfil validado",
            "creditReport": {  // Solo si consentToBureauCheck=true y la consulta fue exitosa
              "score": 720,
              "scoreRange": "BUENO",
              "folioConsulta": "abcdef1234567890",
              "fechaConsulta": "2025-05-09T19:12:34.567Z"
            }
          }
          ```
    - `400 Bad Request`: Perfil incompleto o error de validación.
        - **Cuerpo**:
          ```json
          {
            "success": false,
            "error": "Información incompleta",
            "missingFields": ["curp", "ineBackUrl", ...]  // Campos faltantes
          }
          ```
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse`.
    - `404 Not Found`: El perfil del usuario autenticado no fue encontrado en la base de datos.
        - **Cuerpo**: `{"success": false, "error": "Perfil no encontrado"}`.
    - `500 Internal Server Error`: Error al procesar la solicitud.
        - **Cuerpo**: `ErrorResponse`.
- **Lógica Principal**:
    1. Verifica la autenticación del usuario.
    2. Obtiene el `userId` del usuario autenticado.
    3. Busca el perfil completo del usuario en la base de datos.
    4. Verifica que todos los campos obligatorios estén presentes y que `phoneVerified` sea `true`.
    5. Si el perfil está incompleto, responde con un error 400 y la lista de campos faltantes.
    6. Actualiza el estado de onboarding según la decisión de consentimiento:
       - Si `consentToBureauCheck` es `true`: `PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN`
       - Si `consentToBureauCheck` es `false`: `PROFILE_COMPLETE_BUREAU_CONSENT_DENIED`
    7. Registra el cambio en la tabla `profileFieldHistory`.
    8. Si el usuario dio consentimiento, realiza inmediatamente la consulta simulada al buró:
       - Genera un reporte simulado con datos del perfil
       - Guarda el reporte en la tabla `credit_reports`
       - Actualiza el estado a `DUMMY_BUREAU_CHECK_COMPLETED`
       - Incluye información del reporte en la respuesta
    9. Responde con un mensaje de éxito.
- **Notas**: Para más detalles sobre la integración del buró, consulte [credit-bureau-integration.md](./credit-bureau-integration.md).

### 2. Guardar/Actualizar Datos Temporales de Onboarding
- **Método**: `POST`
- **URL**: `/onboarding/temp`
- **Descripción General**: Permite al usuario autenticado guardar o actualizar un conjunto de datos personales básicos que se recolectan durante las etapas iniciales del proceso de onboarding (ej. nombre, fecha de nacimiento, sexo). Esta información se almacena temporalmente. Al realizar esta acción, el `onboardingStatus` del perfil del usuario se actualiza a `PROFILE_PENDING`, indicando que se han proporcionado datos iniciales del perfil.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Onboarding`
- **Cuerpo de la Solicitud (`application/json`)**: `TempOnboardingDataSchema` (ver Schemas Comunes)
    - *Ejemplo*:
      ```json
      {
        "firstName": "Juan",
        "lastName": "Pérez",
        "motherLastName": "García",
        "birthDate": "1990-01-15",
        "sex": "H"
      }
      ```
- **Respuestas**:
    - `200 OK`: Datos guardados/actualizados con éxito.
        - **Cuerpo**: `{"success": true}`
    - `400 Bad Request`: Error de validación del cuerpo de la solicitud (ej. campos faltantes, formato incorrecto).
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes en `profile-routes_backendDocu.md`).
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse`.
    - `500 Internal Server Error`: Error al interactuar con la base de datos para guardar los datos temporales o actualizar el perfil.
        - **Cuerpo**: `ErrorResponse`.
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Valida que el cuerpo de la solicitud cumpla con `TempOnboardingDataSchema`.
    3.  Obtiene el `userId` del usuario autenticado.
    4.  Llama a `OnboardingService.upsertTempData(userId, request.body)` para guardar o actualizar los datos en la tabla correspondiente (ej. `temp_onboarding_data`).
    5.  Actualiza el perfil del usuario en la tabla `profiles`:
        - Establece `onboardingStatus` a `PROFILE_PENDING`.
        - Actualiza el campo `updatedAt`.
    6.  Inserta un registro en `profileFieldHistory` para documentar el cambio del `onboardingStatus` a `PROFILE_PENDING`.

### 2. Obtener Datos Temporales de Onboarding
- **Método**: `GET`
- **URL**: `/onboarding/temp`
- **Descripción General**: Recupera los datos temporales de onboarding que el usuario autenticado haya guardado previamente.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Onboarding`
- **Respuestas**:
    - `200 OK`: Datos obtenidos con éxito.
        - **Cuerpo**: `{"data": TempOnboardingDataSchema | null}`. Contiene el objeto con los datos temporales del usuario, o `null` si no existen.
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse`.
    - `500 Internal Server Error`: Error al leer los datos temporales de la base de datos.
        - **Cuerpo**: `ErrorResponse`.
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Obtiene el `userId` del usuario autenticado.
    3.  Llama a `OnboardingService.getTempData(userId)` para buscar el registro de datos temporales.
    4.  Responde con los datos encontrados (o `null` si el registro no existe).

### 3. Eliminar Datos Temporales de Onboarding
- **Método**: `DELETE`
- **URL**: `/onboarding/temp`
- **Descripción General**: Elimina los datos temporales de onboarding asociados al usuario autenticado. Esto puede ser útil si el usuario desea reiniciar o corregir la información de esta etapa del onboarding.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Onboarding`
- **Respuestas**:
    - `200 OK`: Datos eliminados con éxito.
        - **Cuerpo**: `{"success": true}`
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse`.
    - `500 Internal Server Error`: Error al intentar eliminar los datos de la base de datos.
        - **Cuerpo**: `ErrorResponse`.
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Obtiene el `userId` del usuario autenticado.
    3.  Llama a `OnboardingService.deleteTempData(userId)` para eliminar el registro de la tabla de datos temporales.

### 4. Consultar Estado del Onboarding
- **Método**: `GET`
- **URL**: `/onboarding/status`
- **Descripción General**: Proporciona el estado actual del proceso de onboarding del usuario autenticado. Además del estado, devuelve detalles relevantes como la fecha de última actualización del perfil, un subconjunto de la información del perfil y los datos temporales de onboarding (si existen).
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Onboarding`
- **Respuestas**:
    - `200 OK`: Estado y detalles obtenidos con éxito.
        - **Cuerpo**: `OnboardingStatusResponseSchema` (ver Schemas Comunes).
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse`.
    - `404 Not Found`: El perfil del usuario autenticado no fue encontrado en la base de datos.
        - **Cuerpo**: `{"status": "NOT_FOUND"}` o un `ErrorResponse` con un mensaje similar.
    - `500 Internal Server Error`: Error al consultar la base de datos o procesar la información.
        - **Cuerpo**: `ErrorResponse`.
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Obtiene el `userId` del usuario autenticado.
    3.  Busca el perfil del usuario en la base de datos (tabla `profiles`) utilizando el `userId`.
    4.  Si el perfil no se encuentra, responde con un error `404 Not Found`.
    5.  Intenta obtener los datos temporales de onboarding del usuario usando `OnboardingService.getTempData(userId)`.
    6.  Prepara un objeto `filteredProfile` que contiene un subconjunto seleccionado de campos del perfil del usuario (para no exponer toda la información).
    7.  Construye la respuesta utilizando el `onboarding_status` del perfil, la fecha `updated_at` como `lastUpdated`, el `filteredProfile` y los `tempOnboarding` data (si se encontraron).

## Schemas Comunes

### `TempOnboardingDataSchema`
Define la estructura para los datos temporales de onboarding.
- `firstName` (string, obligatorio): Primer nombre del usuario.
- `middleName` (string, opcional): Segundo nombre del usuario.
- `lastName` (string, obligatorio): Apellido paterno del usuario.
- `motherLastName` (string, obligatorio): Apellido materno del usuario.
- `birthDate` (string, obligatorio): Fecha de nacimiento del usuario en formato `YYYY-MM-DD`.
    - *Validación*: Debe ser una fecha válida.
- `sex` (string, obligatorio): Sexo del usuario.
    - *Validación*: Debe ser `H` (Hombre) o `M` (Mujer). Longitud: 1 carácter.

### `OnboardingStatusResponseSchema`
Define la estructura de la respuesta para el endpoint `/onboarding/status`.
- `status` (string): El estado actual del `onboarding_status` del perfil del usuario (ej. `"PROFILE_PENDING"`, `"INE_SUBMITTED"`).
- `details` (object, opcional): Contiene información adicional sobre el estado.
    - `lastUpdated` (string, opcional): Fecha y hora de la última actualización del perfil en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).
    - `profile` (object, opcional): Un objeto que contiene un subconjunto de campos del perfil principal del usuario. La estructura exacta de este objeto anidado puede variar según los campos que se decidan exponer (ej. `phoneNumber`, `phoneVerified`, `onboardingStatus`, etc.).
    - `tempOnboarding` (`TempOnboardingDataSchema`, opcional): Los datos temporales de onboarding si existen para el usuario.

### `ErrorResponse`
Schema genérico para respuestas de error. (Referirse a la definición en `docs/routes/profile-routes_backendDocu.md` para consistencia).
- `error` (string): Mensaje de error principal.
- `details` (any, opcional): Detalles adicionales sobre el error.

--- 