# Documentación Detallada del Servicio: Administración (Admin)

Este documento detalla cada uno de los endpoints gestionados por el servicio de Administración (`admin.ts`). Estos endpoints están diseñados para ser utilizados por usuarios con rol de administrador para gestionar perfiles de usuario, préstamos, productos, pagos, reportes de buró de crédito y otros aspectos del sistema.

**Nota sobre Prefijos**: La URL base para estos endpoints puede estar prefijada con `/api` (ej. `/api/admin/...`) si así está configurado globalmente en el servidor. La documentación aquí omite este prefijo global, mostrando las rutas tal como se definen en el archivo `admin.ts`.

**Documentación Relacionada**:
- [Rutas de Buró de Crédito](./credit-bureau-routes_backendDocu.md): Documentación específica de los endpoints para gestionar reportes de buró de crédito.

## Endpoints de Usuarios

### 1. Obtener Todos los Perfiles de Usuarios
- **Método**: `GET`
- **URL**: `/admin/users` 
- **Descripción General**: Devuelve una lista de todos los perfiles de usuarios registrados en el sistema, incluyendo sus cuentas y préstamos. También incluye los datos temporales de onboarding (`temp_data`) asociados a cada perfil, si existen.
- **Autenticación**: Requerida (Token Bearer). Además, se requiere que el usuario autenticado tenga el rol de **administrador**.
- **Respuestas**:
    - `200 OK`: Lista de usuarios obtenida con éxito.
        - **Cuerpo**: `{"users": [ProfileWithAccountsAndLoansSchema, ...]}`. Un array de perfiles de usuario, cada uno con campos `temp_data`, `accounts` y `loans`.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `500 Internal Server Error`: Error al consultar la base de datos.

### 2. Obtener un Perfil de Usuario Específico
- **Método**: `GET`
- **URL**: `/admin/users/{userId}` 
- **Descripción General**: Devuelve un perfil de usuario específico por su ID, incluyendo sus cuentas y préstamos.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Ruta**:
    - `userId` (string, obligatorio): El ID del usuario cuyo perfil se quiere obtener.
- **Respuestas**:
    - `200 OK`: Usuario encontrado y devuelto con éxito.
        - **Cuerpo**: `{"user": ProfileWithAccountsAndLoansSchema}`. El perfil del usuario con sus cuentas y préstamos.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `404 Not Found`: Usuario no encontrado para el `userId` especificado.
    - `500 Internal Server Error`: Error al consultar la base de datos.

### 3. Modificar Datos de Usuario por ID
- **Método**: `PATCH`
- **URL**: `/admin/users/{userId}`
- **Descripción General**: Permite a un administrador modificar los datos de un perfil de usuario específico, identificado por su `userId`. También permite modificar los datos temporales de onboarding (`temp_data`) asociados a ese usuario.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Ruta**:
    - `userId` (string, obligatorio): El ID del usuario cuyo perfil se va a modificar.
- **Cuerpo de la Solicitud (`application/json`)**: `ProfileUpdateSchema` (parcial) intersectado con un campo opcional `temp_data`.
    - *Ejemplo*:
      ```json
      {
        "firstName": "Juan Modificado",
        "onboardingStatus": "INE_REVIEW",
        "temp_data": {
          "someNewTempField": "value"
        } 
      }
      ```
- **Respuestas**:
    - `200 OK`: Usuario actualizado con éxito.
        - **Cuerpo**: `{"user": ProfileWithTempDataSchema}`. El perfil del usuario actualizado, incluyendo `temp_data`.
    - `400 Bad Request`: `userId` no proporcionado en la ruta, o error general al actualizar.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no es administrador.
    - `404 Not Found`: Usuario no encontrado para el `userId` especificado.
    - `500 Internal Server Error`: Error interno del servidor.

## Endpoints de Préstamos

### 4. Obtener Todos los Préstamos
- **Método**: `GET`
- **URL**: `/admin/loans`
- **Descripción General**: Obtiene todos los préstamos del sistema con información de la cuenta y del prestatario. Incluye capacidades de filtrado y paginación.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Consulta (Query)**:
    - `borrowerId` (string, opcional): Filtrar préstamos por ID del prestatario.
    - `status` (string, opcional): Filtrar préstamos por estado (ej. `ACTIVE`, `PAID_OFF`).
    - `minAmount` (number, opcional): Filtrar préstamos por monto mínimo.
    - `maxAmount` (number, opcional): Filtrar préstamos por monto máximo.
    - `fromDate` (string, opcional): Filtrar préstamos creados después de esta fecha (formato: YYYY-MM-DD).
    - `toDate` (string, opcional): Filtrar préstamos creados antes de esta fecha (formato: YYYY-MM-DD).
    - `limit` (number, opcional): Número máximo de resultados a devolver (por defecto: 100).
    - `offset` (number, opcional): Número de resultados a saltar para paginación (por defecto: 0).
- **Respuestas**:
    - `200 OK`: Lista de préstamos obtenida con éxito.
        - **Cuerpo**: `{"loans": [LoanResponseSchema, ...], "total": number}`. Array de préstamos y total de registros.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `500 Internal Server Error`: Error al consultar la base de datos.

### 5. Obtener Tabla de Amortización por Préstamo
- **Método**: `GET`
- **URL**: `/admin/schedules/{loanId}`
- **Descripción General**: Obtiene la tabla de amortización (schedule) de un préstamo específico, junto con la información del préstamo.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Ruta**:
    - `loanId` (string, obligatorio): El ID del préstamo cuya tabla de amortización se quiere obtener.
- **Respuestas**:
    - `200 OK`: Tabla de amortización obtenida con éxito.
        - **Cuerpo**: `{"schedules": [ScheduleResponseSchema, ...], "loan": LoanResponseSchema}`. Array de entradas de la tabla de amortización e información del préstamo.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `404 Not Found`: Préstamo no encontrado.
    - `500 Internal Server Error`: Error al consultar la base de datos.

## Endpoints de Productos de Préstamo

### 6. Obtener Todos los Productos de Préstamo
- **Método**: `GET`
- **URL**: `/admin/loan-products`
- **Descripción General**: Obtiene todos los productos de préstamo disponibles en el sistema.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Respuestas**:
    - `200 OK`: Lista de productos de préstamo obtenida con éxito.
        - **Cuerpo**: `{"products": [LoanProductResponseSchema, ...]}`. Array de productos de préstamo.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `500 Internal Server Error`: Error al consultar la base de datos.

### 7. Crear un Nuevo Producto de Préstamo
- **Método**: `POST`
- **URL**: `/admin/loan-products`
- **Descripción General**: Crea un nuevo producto de préstamo en el sistema.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Cuerpo de la Solicitud (`application/json`)**: `CreateLoanProductSchema` con los siguientes campos:
    - `name` (string, obligatorio): Nombre del producto de préstamo.
    - `productType` (string, obligatorio): Tipo de producto (opciones: `simple`, `revolvente`, `back_to_back`).
    - `ratePeriodicity` (string, obligatorio): Periodicidad de la tasa (opciones: `daily`, `weekly`, `monthly`, `annual`).
    - `rateDefinitionPeriodicity` (string, obligatorio): Periodicidad de definición de tasa (opciones: `daily`, `weekly`, `monthly`, `annual`).
    - `minRate` (number, obligatorio): Tasa mínima (debe ser >= 0).
    - `maxRate` (number, obligatorio): Tasa máxima (debe ser >= 0 y >= minRate).
    - `commissionRate` (number, obligatorio): Tasa de comisión (debe ser >= 0).
    - `lateFeeRate` (number, obligatorio): Tasa de recargo por mora (debe ser >= 0).
    - `minAmount` (number, obligatorio): Monto mínimo del préstamo (debe ser >= 0).
    - `maxAmount` (number, obligatorio): Monto máximo del préstamo (debe ser >= 0 y >= minAmount).
- **Respuestas**:
    - `201 Created`: Producto de préstamo creado con éxito.
        - **Cuerpo**: El producto de préstamo creado con su ID y fechas.
    - `400 Bad Request`: Validación fallida (ej. minRate > maxRate).
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `500 Internal Server Error`: Error al crear el producto de préstamo.

### 8. Actualizar un Producto de Préstamo
- **Método**: `PATCH`
- **URL**: `/admin/loan-products/{id}`
- **Descripción General**: Actualiza un producto de préstamo existente por su ID.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Ruta**:
    - `id` (string, obligatorio): El ID del producto de préstamo a actualizar.
- **Cuerpo de la Solicitud (`application/json`)**: `UpdateLoanProductSchema` (versión parcial de `CreateLoanProductSchema`, todos los campos son opcionales).
- **Respuestas**:
    - `200 OK`: Producto de préstamo actualizado con éxito.
        - **Cuerpo**: `LoanProductResponseSchema`. El producto de préstamo actualizado.
    - `400 Bad Request`: Validación fallida (ej. minRate > maxRate).
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `404 Not Found`: Producto de préstamo no encontrado.
    - `500 Internal Server Error`: Error al actualizar el producto de préstamo.

### 9. Eliminar un Producto de Préstamo
- **Método**: `DELETE`
- **URL**: `/admin/loan-products/{id}`
- **Descripción General**: Elimina un producto de préstamo existente por su ID. Solo se puede eliminar si no hay préstamos asociados a este producto.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Ruta**:
    - `id` (string, obligatorio): El ID del producto de préstamo a eliminar.
- **Respuestas**:
    - `200 OK`: Producto de préstamo eliminado con éxito.
        - **Cuerpo**: `{"success": true, "message": "Producto de préstamo eliminado correctamente"}`.
    - `400 Bad Request`: No se puede eliminar porque tiene préstamos asociados.
        - **Cuerpo**: `{"error": "No se puede eliminar el producto porque tiene préstamos asociados", "loanCount": number}`.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `404 Not Found`: Producto de préstamo no encontrado.
    - `500 Internal Server Error`: Error al eliminar el producto de préstamo.

## Endpoints de Pagos

### 10. Obtener Todos los Pagos
- **Método**: `GET`
- **URL**: `/admin/payments`
- **Descripción General**: Obtiene todos los pagos del sistema con información del préstamo y del prestatario. Incluye capacidades de filtrado y paginación.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Consulta (Query)**:
    - `loanId` (string, opcional): Filtrar pagos por ID del préstamo.
    - `borrowerId` (string, opcional): Filtrar pagos por ID del prestatario.
    - `fromDate` (string, opcional): Filtrar pagos realizados después de esta fecha (formato: YYYY-MM-DD).
    - `toDate` (string, opcional): Filtrar pagos realizados antes de esta fecha (formato: YYYY-MM-DD).
    - `minAmount` (number, opcional): Filtrar pagos por monto mínimo.
    - `maxAmount` (number, opcional): Filtrar pagos por monto máximo.
    - `method` (string, opcional): Filtrar pagos por método de pago.
    - `limit` (number, opcional): Número máximo de resultados a devolver (por defecto: 100).
    - `offset` (number, opcional): Número de resultados a saltar para paginación (por defecto: 0).
- **Respuestas**:
    - `200 OK`: Lista de pagos obtenida con éxito.
        - **Cuerpo**: `{"payments": [PaymentResponseSchema, ...], "total": number}`. Array de pagos y total de registros.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `500 Internal Server Error`: Error al consultar la base de datos.

## Endpoints de Onboarding

### 11. Obtener Usuarios con Onboarding Pendiente
- **Método**: `GET`
- **URL**: `/admin/onboarding/pending`
- **Descripción General**: Obtiene todos los usuarios con pasos de onboarding pendientes o en el estado específico indicado.
- **Autenticación**: Requerida (Token Bearer y rol de administrador).
- **Parámetros de Consulta (Query)**:
    - `status` (string, opcional): Filtrar usuarios por estado específico de onboarding. Si no se proporciona, se devolverán todos los usuarios con estados de onboarding incompletos.
    - `limit` (number, opcional): Número máximo de resultados a devolver (por defecto: 100).
    - `offset` (number, opcional): Número de resultados a saltar para paginación (por defecto: 0).
- **Respuestas**:
    - `200 OK`: Lista de usuarios con onboarding pendiente obtenida con éxito.
        - **Cuerpo**: `{"users": [ProfileWithTempDataSchema, ...], "total": number}`. Array de perfiles de usuario y total de registros.
    - `401 Unauthorized`: Token no proporcionado o inválido.
    - `403 Forbidden`: El usuario autenticado no tiene rol de administrador.
    - `500 Internal Server Error`: Error al consultar la base de datos.

## Schemas Comunes

### `ProfileResponseSchema`
Representa la estructura completa de un perfil de usuario. Incluye campos como `id`, `userId`, `phoneNumber`, `firstName`, `lastName`, `curp`, `onboardingStatus`, fechas de INE, etc.

### `ProfileWithTempDataSchema`
Define la estructura de un perfil de usuario combinado con sus datos temporales de onboarding.
- **Intersección de**:
    - `ProfileResponseSchema` (todos los campos del perfil principal).
    - `Type.Object({ temp_data: Type.Optional(Type.Any()) })` (un campo opcional `temp_data` que puede contener cualquier estructura, reflejando los datos temporales).

### `ProfileWithAccountsAndLoansSchema`
Define la estructura de un perfil de usuario combinado con sus datos temporales de onboarding, cuentas y préstamos.
- **Intersección de**:
    - `ProfileWithTempDataSchema` (todos los campos del perfil principal y temp_data).
    - `Type.Object({ accounts: Type.Optional(Type.Array(AccountResponseSchema)), loans: Type.Optional(Type.Array(LoanResponseSchema)) })` (campos opcionales para cuentas y préstamos).

### `LoanResponseSchema`
Define la estructura de un préstamo con información opcional relacionada (cuenta, prestatario, producto).
- **Campos principales**: `id`, `accountId`, `borrowerId`, `productId`, `principal`, `term`, `rateApplied`, `ratePeriodicity`, `commissionAmount`, `status`, `startDate`, `expectedEndDate`, `createdAt`.
- **Campos relacionados**: 
  - `account`: Información de la cuenta asociada (opcional).
  - `borrower`: Información del prestatario (opcional).
  - `product`: Información del producto de préstamo (opcional).

### `LoanProductResponseSchema`
Define la estructura de un producto de préstamo.
- **Campos**: `id`, `name`, `productType`, `ratePeriodicity`, `rateDefinitionPeriodicity`, `minRate`, `maxRate`, `commissionRate`, `lateFeeRate`, `minAmount`, `maxAmount`, `createdAt`.

### `PaymentResponseSchema`
Define la estructura de un pago con información opcional relacionada (préstamo, prestatario).
- **Campos principales**: `id`, `loanId`, `amount`, `paymentDate`, `method`, `reference`, `createdAt`.
- **Campos relacionados**:
  - `loan`: Información básica del préstamo asociado (opcional).
  - `borrower`: Información básica del prestatario (opcional).

### `ScheduleResponseSchema`
Define la estructura de una entrada en la tabla de amortización de un préstamo.
- **Campos**: `id`, `loanId`, `periodIndex`, `dueDate`, `principalDue`, `interestDue`, `feeDue`, `principalPaid`, `interestPaid`, `feePaid`, `paid`, `partiallyPaid`.

### `AccountResponseSchema`
Define la estructura de una cuenta bancaria.
- **Campos**: `id`, `profileId`, `accountType`, `status`, `currency`, `createdAt`, `updatedAt`.