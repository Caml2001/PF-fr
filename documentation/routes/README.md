# Documentación de Rutas de la API

Este documento describe las rutas disponibles en la API de PrestaFirme.

## Prefijo Global

Es importante notar que algunas rutas, como las de Préstamos y Cuentas, pueden estar prefijadas con `/api` (ej. `/api/loans`). Este prefijo generalmente se configura a nivel global en el servidor. Las rutas se listan aquí con el prefijo si así aparecían en la especificación inicial.

## Autenticación (Auth)

Endpoints relacionados con el registro, inicio y cierre de sesión de usuarios.
Para una documentación más detallada, consulta: [Autenticación (Auth) - Documentación Detallada](./auth-routes_backendDocu.md)

### GET /auth/test
- **Descripción**: Ruta de prueba para verificar que el módulo de autenticación está operativo.
- **Autenticación**: No requerida (usualmente).

### POST /auth/signup
- **Descripción**: Registra un nuevo usuario en el sistema.
- **Autenticación**: No requerida.
- **Cuerpo Esperado**: Credenciales del usuario (ej. `email`, `password`).

### POST /auth/signin
- **Descripción**: Autentica a un usuario existente y devuelve un token de sesión.
- **Autenticación**: No requerida.
- **Cuerpo Esperado**: Credenciales del usuario (ej. `email`, `password`).

### GET /auth/user
- **Descripción**: Obtiene los detalles del usuario actualmente autenticado.
- **Autenticación**: Requerida (Token Bearer).

### POST /auth/signout
- **Descripción**: Cierra la sesión del usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).

## Onboarding

Endpoints para gestionar el proceso de incorporación de nuevos usuarios.
Para una documentación más detallada, consulta:
- [Onboarding - Documentación Detallada](./onboarding-routes_backendDocu.md)
- [Integración de Buró de Crédito - Documentación Detallada](./credit-bureau-integration.md)

### POST /onboarding/complete
- **Descripción**: Verifica que el perfil del usuario esté completo, registra su consentimiento para la consulta al buró de crédito, y si consiente, realiza la consulta simulada al buró inmediatamente.
- **Autenticación**: Requerida (Token Bearer).
- **Cuerpo Esperado**: `{ "consentToBureauCheck": true }` (o `false`).

### POST /onboarding/temp
- **Descripción**: Guarda o actualiza datos temporales del usuario durante el proceso de onboarding.
- **Autenticación**: Requerida (Token Bearer).
- **Cuerpo Esperado**: Datos temporales relevantes al onboarding (ej. `firstName`, `birthDate`).

### GET /onboarding/temp
- **Descripción**: Obtiene los datos temporales de onboarding guardados para el usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).

### DELETE /onboarding/temp
- **Descripción**: Elimina los datos temporales de onboarding del usuario autenticado (útil para reiniciar el flujo).
- **Autenticación**: Requerida (Token Bearer).

### GET /onboarding/status
- **Descripción**: Consulta el estado actual del proceso de onboarding para el usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).

## Administración (Admin)

Endpoints para la gestión de usuarios, préstamos, productos, pagos y reportes de buró de crédito por parte de administradores.
Para una documentación más detallada, consulta:
- [Administración (Admin) - Documentación Detallada](./admin-routes_backendDocu.md)
- [Rutas de Buró de Crédito - Documentación Detallada](./credit-bureau-routes_backendDocu.md)

### GET /admin/users
- **Descripción**: Obtiene una lista de todos los perfiles de usuarios.
- **Autenticación**: Requerida (Token Bearer y permisos de Administrador).

### PATCH /admin/users/{userId}
- **Descripción**: Permite a un administrador modificar la información de un usuario específico.
- **Autenticación**: Requerida (Token Bearer y permisos de Administrador).
- **Parámetros de Ruta**:
    - `userId`: El ID del usuario a modificar.
- **Cuerpo Esperado**: Campos del perfil del usuario que se desean actualizar.

### POST /admin/loan-products
- **Descripción**: Permite a un administrador crear un nuevo producto de préstamo.
- **Autenticación**: Requerida (Token Bearer y permisos de Administrador).
- **Cuerpo Esperado**: Detalles del producto como nombre, tipo, tasas y montos.

### GET /admin/credit-bureau
- **Descripción**: Obtiene una lista paginada de todos los reportes de buró de crédito con información básica del perfil asociado.
- **Autenticación**: Requerida (Token Bearer y permisos de Administrador).
- **Parámetros de Consulta**: Opciones de paginación y filtrado como `limit`, `offset` y `profileId`.

### GET /admin/credit-bureau/{id}
- **Descripción**: Obtiene todos los detalles de un reporte específico de buró de crédito.
- **Autenticación**: Requerida (Token Bearer y permisos de Administrador).
- **Parámetros de Ruta**: `id` del reporte.

## Perfil (Profile)

Endpoints para que los usuarios gestionen su propia información de perfil.
Para una documentación más detallada, consulta: [Perfil (Profile) - Documentación Detallada](./profile-routes_backendDocu.md)

### PATCH /profile/phone
- **Descripción**: Envía o actualiza el número de teléfono del usuario e inicia el proceso de verificación mediante OTP (One-Time Password).
- **Autenticación**: Requerida (Token Bearer).
- **Cuerpo Esperado**: `phone_number` y opcionalmente `country`.

### POST /profile/phone/verify
- **Descripción**: Verifica el número de teléfono del usuario utilizando el código OTP que recibió.
- **Autenticación**: Requerida (Token Bearer).
- **Cuerpo Esperado**: `phone_number`, `token` (código OTP) y opcionalmente `country`.

### PATCH /profile/name
- **Descripción**: Actualiza el nombre completo (nombre, segundo nombre, apellidos) del usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).
- **Cuerpo Esperado**: Al menos uno de los campos del nombre: `first_name`, `middle_name`, `last_name`, `mother_last_name`.

### GET /profile/profile
- **Descripción**: Obtiene la información completa del perfil del usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).

### PATCH /profile/profile
- **Descripción**: Actualiza diversos campos del perfil del usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).
- **Cuerpo Esperado**: Un objeto con los campos del perfil que se desean modificar.

### GET /profile/credit
- **Descripción**: Obtiene información sobre el límite de crédito del usuario, saldo utilizado y disponible.
- **Autenticación**: Requerida (Token Bearer).

## Verificación (Verification)

Endpoints específicamente dedicados a los procesos de verificación de identidad del usuario.
Este endpoint está detallado en la documentación de Perfil. Para más detalles, consulta: [Perfil (Profile) - Documentación Detallada](./profile-routes_backendDocu.md)

### POST /profile/ine/verify
- **Descripción**: Permite al usuario subir las imágenes de su INE (documento de identidad mexicano, frontal y trasera). El sistema procesa estas imágenes para extraer datos mediante OCR (Reconocimiento Óptico de Caracteres) y realizar verificaciones.
- **Autenticación**: Requerida (Token Bearer).
- **Tipo de Contenido**: `multipart/form-data`.
- **Cuerpo Esperado**: Archivos de imagen `ineFrontal` e `ineTrasera`.

## Préstamos (Loans)

Endpoints para la solicitud y gestión de préstamos.
Para una documentación más detallada, consulta: [Préstamos (Loans) - Documentación Detallada](./loans-routes_backendDocu.md)

### GET /loan-products
- **Descripción**: Obtiene un listado de todos los productos de préstamo disponibles.
- **Autenticación**: No requerida.


### POST /loans/quote
- **Descripción**: Calcula una cotización de préstamo basada en los parámetros proporcionados, incluyendo tabla de amortización.
- **Autenticación**: No requerida.
- **Cuerpo Esperado**: `productId`, `amount`, y `term` o `payment`.

### POST /api/loans
- **Descripción**: Permite a un usuario autenticado solicitar un nuevo préstamo.
- **Autenticación**: Requerida (Token Bearer).
- **Cuerpo Esperado**: Detalles del préstamo como `productId`, `principal`, y `term` o `paymentAmount`.

### GET /loans/{id}
- **Descripción**: Obtiene los detalles completos de un préstamo específico.
- **Autenticación**: Requerida (Token Bearer).
- **Parámetros de Ruta**: `id` del préstamo.

### GET /loans/{id}/schedule
- **Descripción**: Obtiene la tabla de amortización completa de un préstamo específico.
- **Autenticación**: Requerida (Token Bearer).
- **Parámetros de Ruta**: `id` del préstamo.

### POST /loans/{id}/payments
- **Descripción**: Registra un pago para un préstamo específico. Puede ser usado como webhook para STP.
- **Autenticación**: Requerida (Token Bearer).
- **Parámetros de Ruta**: `id` del préstamo.
- **Cuerpo Esperado**: Detalles del pago como monto, método, referencia.

### GET /loans/{id}/charges
- **Descripción**: Obtiene todos los cargos (comisiones, recargos, etc.) asociados a un préstamo.
- **Autenticación**: Requerida (Token Bearer).
- **Parámetros de Ruta**: `id` del préstamo.

## Cuentas (Accounts)

Endpoints para consultar información de las cuentas asociadas al usuario.
Para una documentación más detallada, consulta: [Cuentas (Accounts) - Documentación Detallada](./accounts-routes_backendDocu.md)

### GET /api/accounts/{accountId}/balance
- **Descripción**: Obtiene el saldo actual de una cuenta específica perteneciente al usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).
- **Parámetros de Ruta**:
    - `accountId`: El ID de la cuenta a consultar.

### GET /api/accounts/{accountId}/ledger
- **Descripción**: Obtiene los movimientos (libro mayor) de una cuenta específica perteneciente al usuario autenticado.
- **Autenticación**: Requerida (Token Bearer).
- **Parámetros de Ruta**:
    - `accountId`: El ID de la cuenta para la cual se quieren obtener los movimientos.

## Buró de Crédito (Simulado)

Para la integración con el buró de crédito se ha implementado una simulación que prepara la infraestructura para una futura conexión con el servicio real.

Para una documentación completa, consulta: [Integración de Buró de Crédito - Documentación Detallada](./credit-bureau-integration.md)

### Características principales:

- **Recolección de consentimiento**: Se registra la decisión del usuario para la consulta al buró.
- **Consulta simulada**: Genera datos realistas basados en el perfil del usuario.
- **Score crediticio**: Determina un score crediticio aleatorio y su interpretación (BUENO, REGULAR, MALO).
- **Integración en onboarding**: La consulta se realiza inmediatamente después de dar consentimiento.
- **Almacenamiento estructurado**: Los reportes se guardan siguiendo el esquema real del buró.

### Flujo de integración:

1. El usuario completa su perfil
2. El usuario otorga consentimiento para la consulta al buró
3. Se genera inmediatamente un reporte de buró simulado
4. El score crediticio queda disponible para:
   - Mostrar al usuario
   - Tomar decisiones en el proceso de solicitud de préstamos
   - Personalizar ofertas de productos