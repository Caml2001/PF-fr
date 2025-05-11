# Documentación Detallada del Servicio: Perfil (Profile)

Este documento detalla cada uno de los endpoints gestionados por el servicio de Perfil (`profile.ts`). Está diseñado para servir como referencia técnica exhaustiva tanto para el equipo de backend como para el equipo de frontend.

## Endpoints

### 1. Actualizar/Enviar Número de Teléfono e Iniciar Verificación OTP
- **Método**: `PATCH`
- **URL**: `/profile/phone`
- **Descripción General**: Permite al usuario autenticado enviar o actualizar su número de teléfono. Tras una validación exitosa del formato, se inicia el proceso de verificación enviando un código OTP (One-Time Password) al número proporcionado. El estado de onboarding del usuario se actualiza a `OTP_PENDING`.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Profile`
- **Cuerpo de la Solicitud (`application/json`)**:
    - `phone_number` (string, obligatorio): Número de teléfono del usuario sin código de país. Longitud mínima: 8 caracteres.
        - *Ejemplo*: `"5512345678"`
    - `country` (string, opcional, default: `MX`): Código de país ISO de 2 letras.
        - *Ejemplo*: `"MX"`
- **Respuestas**:
    - `200 OK`: Verificación iniciada con éxito.
        - **Cuerpo**: `{"message": "Verification code sent to your phone number. Use the /profile/phone/verify endpoint to confirm."}`
    - `400 Bad Request`: Error de validación o formato incorrecto.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
        - *Ejemplos de Mensajes de Error*:
            - `"Invalid phone number format."` (Si el formato no es válido para el país).
            - `"This phone number is already associated with another account."` (Si Supabase detecta el teléfono en otra cuenta).
            - `"The phone number format provided is invalid according to the authentication provider."` (Error genérico de formato de Supabase).
    - `401 Unauthorized`: Token no proporcionado, inválido, o usuario no encontrado para el token.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Ejemplo*: `{"error": "Unauthorized: No user associated with token."}`
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
        - *Ejemplos de Mensajes de Error*:
            - `"Failed to initiate phone verification via provider."` (Si Supabase falla al actualizar el usuario/enviar OTP).
            - `"An internal error occurred while formatting the phone number."`
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Valida el cuerpo de la solicitud (`phone_number`, `country`).
    3.  Utiliza `ProfileService` para validar y formatear el `phone_number` según el `country`.
    4.  Llama a `fastify.supabase.auth.updateUser()` para asociar el teléfono formateado al usuario en Supabase Auth (esto generalmente desencadena el envío del OTP por parte de Supabase).
    5.  Actualiza el perfil del usuario en la base de datos local (`profiles`):
        - Establece `onboardingStatus` a `'OTP_PENDING'`.
        - Guarda el `phoneNumber` formateado.
        - Actualiza `updatedAt`.
    6.  Registra el cambio de `onboardingStatus` en la tabla `profileFieldHistory`.

### 2. Verificar Número de Teléfono con OTP
- **Método**: `POST`
- **URL**: `/profile/phone/verify`
- **Descripción General**: Permite al usuario autenticado verificar su número de teléfono ingresando el código OTP que recibió previamente. Si el OTP es válido, el número de teléfono se marca como verificado en Supabase y el estado de onboarding del usuario en la base de datos local se actualiza a `REGISTERED_BASIC`.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Profile`
- **Cuerpo de la Solicitud (`application/json`)**:
    - `phone_number` (string, obligatorio): Número de teléfono al que se envió el OTP (sin código de país). Longitud mínima: 8 caracteres.
        - *Ejemplo*: `"5512345678"`
    - `country` (string, opcional, default: `MX`): Código de país ISO de 2 letras, debe coincidir con el usado al enviar el OTP.
        - *Ejemplo*: `"MX"`
    - `token` (string, obligatorio): Código OTP de 6 dígitos recibido por el usuario.
        - *Ejemplo*: `"123456"`
- **Respuestas**:
    - `200 OK`: Número de teléfono verificado con éxito.
        - **Cuerpo**: `{"message": "Phone number verified successfully."}`
    - `400 Bad Request`: Error de validación, OTP inválido o expirado.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
        - *Ejemplos de Mensajes de Error*:
            - `"Invalid or expired verification code."`
            - `"Invalid phone number format."`
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
        - *Ejemplos de Mensajes de Error*:
            - `"Failed to verify phone number via provider."` (Si Supabase falla al verificar el OTP).
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Valida el cuerpo de la solicitud (`phone_number`, `country`, `token`).
    3.  Utiliza `ProfileService` para validar y formatear el `phone_number`.
    4.  Llama a `fastify.supabase.auth.verifyOtp()` con el tipo `sms` para verificar el token.
    5.  Si la verificación de Supabase es exitosa:
        - Actualiza el perfil del usuario en la base de datos local (`profiles`):
            - Establece `phoneVerified` a `true`.
            - Establece `onboardingStatus` a `'REGISTERED_BASIC'`.
            - Actualiza `updatedAt`.
        - Registra el cambio de `onboardingStatus` en la tabla `profileFieldHistory`.

### 3. Actualizar Nombre del Usuario
- **Método**: `PATCH`
- **URL**: `/profile/name`
- **Descripción General**: Permite al usuario autenticado actualizar sus datos de nombre (primer nombre, segundo nombre, apellido paterno, apellido materno). Se debe proporcionar al menos uno de los campos del nombre.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Profile`
- **Cuerpo de la Solicitud (`application/json`)**: (Al menos una propiedad es requerida)
    - `first_name` (string, opcional): Primer nombre del usuario. Longitud mínima: 1 carácter.
    - `middle_name` (string | null, opcional): Segundo nombre del usuario (puede ser nulo o string). Longitud mínima: 1 carácter si se provee.
    - `last_name` (string, opcional): Apellido paterno del usuario. Longitud mínima: 1 carácter.
    - `mother_last_name` (string, opcional): Apellido materno del usuario. Longitud mínima: 1 carácter.
- **Respuestas**:
    - `200 OK`: Nombre actualizado con éxito.
        - **Cuerpo**: `ProfileResponseSchema` (ver Schemas Comunes) con el perfil actualizado.
    - `400 Bad Request`: Error de validación (ej. ningún campo proporcionado, datos inválidos).
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Ejemplo*: `{"error": "Invalid input data."}` (si falla la validación del schema TypeBox, ej. ningún campo enviado).
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
    - `404 Not Found`: Perfil del usuario no encontrado (manejado por `ProfileServiceError`).
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Ejemplo*: `{"error": "Profile not found"}`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Ejemplo*: `{"error": "An unexpected error occurred while updating the name."}`.
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Valida el cuerpo de la solicitud (al menos un campo de nombre debe estar presente).
    3.  Llama a `profileService.updateName()` que:
        - Busca el perfil del usuario.
        - Actualiza solo los campos del nombre proporcionados en la base de datos (`profiles`).
        - Registra cada cambio individual de campo de nombre en `profileFieldHistory`.
        - Actualiza `updatedAt` en el perfil.
        - Devuelve el perfil completo y actualizado.
    4.  Responde con el perfil actualizado.

### 4. Subir y Procesar Imágenes del INE (OCR)
- **Método**: `POST`
- **URL**: `/profile/ine/verify`
- **Descripción General**: Permite al usuario autenticado subir las imágenes frontal y trasera de su INE. El servicio carga las imágenes, realiza OCR para extraer datos, compara estos datos con la información de onboarding temporal previamente guardada. Si los datos coinciden, se actualiza el perfil del usuario con la información del INE, se eliminan los datos temporales y el estado de onboarding cambia a `INE_SUBMITTED`. Si no coinciden, el estado cambia a `INE_REVIEW`.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Profile`, `Verification`
- **Consumo de Medios (Request Content Type)**: `multipart/form-data`
- **Cuerpo de la Solicitud (Multipart Form Data)**:
    - `ineFrontal` (file, obligatorio): Archivo de imagen del anverso del INE.
        - *Tipos de archivo permitidos*: `image/jpeg`, `image/png`, `image/webp`.
    - `ineTrasera` (file, obligatorio): Archivo de imagen del reverso del INE.
        - *Tipos de archivo permitidos*: `image/jpeg`, `image/png`, `image/webp`.
- **Respuestas**:
    - `200 OK`: INE procesado y perfil actualizado con éxito (datos coincidieron).
        - **Cuerpo**: `ProfileResponseSchema` (ver Schemas Comunes) con el perfil actualizado.
    - `400 Bad Request`:
        - Error en la solicitud:
            - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
            - *Ejemplos*: `"Request must be multipart/form-data"`, `"Missing required INE images (ineFrontal, ineTrasera)"`, `"Invalid file type uploaded for ineFrontal"`.
        - Datos de la INE no coinciden con los datos temporales de onboarding:
            - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Mensaje*: `"Los datos de la INE no coinciden con los datos de onboarding."` (En este caso, el estado de onboarding se actualiza a `INE_REVIEW`).
        - No se encontraron datos temporales de onboarding para comparación:
            - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Mensaje*: `"No se encontraron datos temporales de onboarding para comparación."` o `"Datos temporales de onboarding inválidos o incompletos."`
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
    - `500 Internal Server Error`: Error durante el procesamiento OCR, guardado de archivos, o actualización de la base de datos.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
        - *Ejemplos*: `"Failed to structure INE data. Please try again later or contact support."`, `"Error actualizando perfil tras OCR."`
- **Lógica Principal**:
    1.  Verifica autenticación y que la solicitud sea `multipart/form-data`.
    2.  Procesa los archivos `ineFrontal` e `ineTrasera`: valida tipos MIME y los convierte a `Buffer`.
    3.  Llama a `extractAndStructureIneData(ineFrontBuffer, ineBackBuffer)` del `verification.service` que:
        a.  Sube las imágenes a un almacenamiento (ej. Supabase Storage) y obtiene las URLs.
        b.  Ejecuta OCR en las imágenes.
        c.  Intenta estructurar los datos extraídos del OCR (nombre, apellidos, CURP, dirección, clave de elector, fechas de INE).
        d.  Devuelve un objeto `IneProcessingResult` con `structuredData` y las URLs de las imágenes.
    4.  Obtiene los datos temporales de onboarding del usuario (`OnboardingService.getTempData`). Valida que existan y tengan la estructura esperada.
    5.  Normaliza y compara los datos del INE (`ineData`) con los datos temporales (`tempData`): `firstName`, `lastName`, `motherLastName`. También compara `birthDate` y `sex` (el `birthDate` y `sex` del INE se extraen de su `curp`).
    6.  **Si los datos NO coinciden**:
        a.  Actualiza `onboardingStatus` del perfil a `INE_REVIEW`.
        b.  Registra el cambio en `profileFieldHistory`.
        c.  Responde con error 400.
    7.  **Si los datos SÍ coinciden**:
        a.  Elimina los datos temporales de onboarding (`OnboardingService.deleteTempData`).
        b.  Prepara `profileUpdateData` con los campos extraídos del INE (`firstName`, `middleName`, `lastName`, `motherLastName`, `curp`, `street`, `number`, `colonia`, `municipality`, `state`, `postalCode`, `ineClaveElector`, `ineIssueDate` (parseado a Date), `ineExpirationDate` (parseado a Date), `ineFrontUrl`, `ineBackUrl`).
        c.  Establece `onboardingStatus` a `INE_SUBMITTED`.
        d.  Actualiza el perfil del usuario en la base de datos (`db.update(profiles)`).
        e.  Registra el cambio de `onboardingStatus` y otros campos actualizados del INE en `profileFieldHistory`.
        f.  Responde con el perfil actualizado.
    8.  Maneja errores, incluyendo un intento de eliminar archivos subidos al storage si falla la actualización de la base de datos.

### 5. Obtener Perfil del Usuario
- **Método**: `GET`
- **URL**: `/profile/profile`
- **Descripción General**: Recupera la información completa del perfil del usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Profile`
- **Respuestas**:
    - `200 OK`: Perfil obtenido con éxito.
        - **Cuerpo**: `ProfileResponseSchema` (ver Schemas Comunes) con los datos del perfil.
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
    - `404 Not Found`: Perfil del usuario no encontrado.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Mensaje*: `"Profile not found for the given user ID"`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Llama a `profileService.getProfileByUserId()` para obtener el perfil de la base de datos.
    3.  El servicio se encarga de formatear las fechas (`ineIssueDate`, `ineExpirationDate` a `YYYY-MM-DD`; `createdAt`, `updatedAt` a ISO `date-time string`) para la respuesta.
    4.  Responde con los datos del perfil.

### 6. Actualizar Perfil del Usuario (Parcial)
- **Método**: `PATCH`
- **URL**: `/profile/profile`
- **Descripción General**: Permite al usuario autenticado actualizar de forma parcial diversos campos de su perfil. Esto usualmente incluye datos personales y de dirección que no son gestionados por endpoints más específicos. Si con esta actualización el perfil cumple los requisitos para ser considerado completo (ej. estaba en `INE_SUBMITTED` y se llenan campos de domicilio), el estado de onboarding puede pasar a `PROFILE_COMPLETED` y se podría intentar una evaluación de crédito inicial.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Profile`
- **Cuerpo de la Solicitud (`application/json`)**: `ProfilePatchBodySchema` (todos los campos son opcionales)
    - `firstName` (string, opcional)
    - `middleName` (string, opcional, puede ser null)
    - `lastName` (string, opcional)
    - `motherLastName` (string, opcional)
    - `curp` (string, opcional): Debe seguir el patrón regex de CURP.
        - *Patrón*: `^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$`
    - `street` (string, opcional)
    - `number` (string, opcional): Número exterior/interior.
    - `colonia` (string, opcional)
    - `municipality` (string, opcional)
    - `state` (string, opcional)
    - `postalCode` (string, opcional): Código postal de 5 dígitos.
        - *Patrón*: `^\d{5}$`
    - `ineClaveElector` (string, opcional)
    - `ineIssueDate` (string, opcional): Fecha en formato `YYYY-MM-DD`.
    - `ineExpirationDate` (string, opcional): Fecha en formato `YYYY-MM-DD`.
    - `proofOfAddressUrl` (string, opcional): URL a un comprobante de domicilio previamente subido.
- **Respuestas**:
    - `200 OK`: Perfil actualizado con éxito.
        - **Cuerpo**: `ProfileResponseSchema` (ver Schemas Comunes) con el perfil actualizado.
    - `400 Bad Request`: Error de validación (ej. formato de CURP incorrecto, fecha inválida).
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
    - `404 Not Found`: Perfil del usuario no encontrado (manejado por `ProfileServiceError`).
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Mensaje*: `"Profile not found"`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
- **Lógica Principal**:
    1.  Verifica la autenticación del usuario.
    2.  Valida el cuerpo de la solicitud contra `ProfilePatchBodySchema`.
    3.  Llama a `profileService.updateProfile()` que:
        a.  Busca el perfil del usuario.
        b.  Para cada campo proporcionado en el cuerpo de la solicitud:
            - Valida el dato (ej. `parseDateString` para fechas).
            - Actualiza el campo en el objeto del perfil.
            - Registra el cambio en `profileFieldHistory`.
        c.  Verifica si el perfil ahora está completo para pasar a `PROFILE_COMPLETED`. Esto sucede si el estado anterior era `INE_SUBMITTED` y ahora se han proporcionado los campos de dirección (`street`, `number`, `colonia`, `municipality`, `state`, `postalCode`).
        d.  Si el estado cambia a `PROFILE_COMPLETED`:
            - Registra este cambio de estado en `profileFieldHistory`.
            - Llama a `initialCreditService.evaluateAndAssignInitialCredit()` para intentar determinar y asignar una línea de crédito inicial.
        e.  Guarda todos los cambios en la base de datos (`profiles`).
        f.  Devuelve el perfil actualizado.
    4.  Formatea las fechas del perfil devuelto por el servicio para la respuesta.
    5.  Responde con el perfil actualizado.

### 7. Consultar Crédito Disponible
- **Método**: `GET`
- **URL**: `/profile/credit`
- **Descripción General**: Permite al usuario autenticado consultar información sobre su límite de crédito, incluyendo el monto total asignado, el monto utilizado (préstamos activos) y el saldo disponible para nuevos préstamos.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Profile`, `Credit`
- **Respuestas**:
    - `200 OK`: Información de crédito obtenida con éxito.
        - **Cuerpo**: 
            ```json
            {
              "creditLimit": 10000,
              "creditUsed": 5000,
              "creditAvailable": 5000
            }
            ```
          - `creditLimit` (number): Límite de crédito total asignado al usuario en pesos mexicanos.
          - `creditUsed` (number): Cantidad del crédito que ya está siendo utilizada en préstamos activos en pesos mexicanos.
          - `creditAvailable` (number): Saldo disponible para nuevos préstamos en pesos mexicanos.
    - `401 Unauthorized`: Token no proporcionado o inválido.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
    - `404 Not Found`: No se encontró información de crédito para el usuario.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes). *Mensaje*: `"Credit information not found for this user"`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponse` (ver Schemas Comunes).
- **Lógica Principal**:
    1. Verifica la autenticación del usuario y obtiene su ID.
    2. Llama a `creditLimitService.getCreditInformation(userId)` que:
        a. Busca la información de límite de crédito del usuario.
        b. Calcula el crédito utilizado sumando los montos de préstamos activos.
        c. Calcula el crédito disponible restando el crédito utilizado del límite total.
        d. Utiliza la clase Money para garantizar el manejo correcto de decimales y redondeo.
    3. Responde con el objeto de información de crédito.

## Schemas Comunes

### `ProfileResponseSchema`
Representa el objeto de perfil de usuario devuelto en varias respuestas.
- `id` (string): ID único del perfil en la base de datos.
- `userId` (string): ID del usuario (referencia a `auth.users.id` de Supabase).
- `phoneNumber` (string | null): Número de teléfono del usuario (formato E.164).
- `phoneVerified` (boolean): Indica si el número de teléfono ha sido verificado.
- `onboardingStatus` (string): Estado actual del proceso de onboarding del usuario.
    - *Valores posibles (ejemplos)*: `NEW`, `OTP_PENDING`, `REGISTERED_BASIC`, `PROFILE_PENDING`, `INE_SUBMITTED`, `INE_REVIEW`, `PROFILE_COMPLETED`, `CREDIT_OFFERED`, `CREDIT_REJECTED`, `ACTIVE_LOAN`, etc.
- `firstName` (string | null): Primer nombre.
- `middleName` (string | null): Segundo nombre.
- `lastName` (string | null): Apellido paterno.
- `motherLastName` (string | null): Apellido materno.
- `curp` (string | null): Clave Única de Registro de Población.
- `ineFrontUrl` (string | null): URL de la imagen frontal del INE almacenada.
- `ineBackUrl` (string | null): URL de la imagen trasera del INE almacenada.
- `street` (string | null): Calle del domicilio.
- `number` (string | null): Número exterior/interior del domicilio.
- `colonia` (string | null): Colonia del domicilio.
- `municipality` (string | null): Municipio del domicilio.
- `state` (string | null): Estado del domicilio.
- `postalCode` (string | null): Código postal del domicilio.
- `proofOfAddressUrl` (string | null): URL del comprobante de domicilio almacenado.
- `ineClaveElector` (string | null): Clave de elector del INE.
- `ineIssueDate` (string | null): Fecha de emisión del INE en formato `YYYY-MM-DD`.
- `ineExpirationDate` (string | null): Fecha de expiración del INE en formato `YYYY-MM-DD`.
- `createdAt` (string): Fecha y hora de creación del perfil en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- `updatedAt` (string): Fecha y hora de la última actualización del perfil en formato ISO 8601.

### `ErrorResponse`
Schema genérico para respuestas de error.
- `error` (string): Un mensaje de error principal, legible por humanos o un código de error.
- `details` (any, opcional): Información adicional sobre el error, que puede ser un string, un objeto con más detalles de validación, etc. (El tipo `any` se usa aquí por flexibilidad, pero podría ser más específico si se conocen los formatos comunes de `details`).
    - *Ejemplo*: `{"error": "Validation failed", "details": [{"path": "/body/field", "message": "is required"}]}`

--- 