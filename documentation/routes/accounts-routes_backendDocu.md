# Documentación Detallada del Servicio: Cuentas (Accounts)

Este documento detalla cada uno de los endpoints gestionados por el servicio de Cuentas (`accounts.ts`). Está diseñado para servir como referencia técnica exhaustiva tanto para el equipo de backend como para el equipo de frontend.

**Nota sobre Prefijos**: La URL base para estos endpoints puede estar prefijada con `/api` (ej. `/api/accounts/...`) si así está configurado globalmente en el servidor. La documentación aquí omite este prefijo global, mostrando las rutas tal como se definen en el archivo `accounts.ts`.

## Endpoints

### 1. Obtener Saldo de la Cuenta
- **Método**: `GET`
- **URL**: `/accounts/{accountId}/balance` (o `/api/accounts/{accountId}/balance` con prefijo global)
- **Descripción General**: Recupera el saldo actual de una cuenta específica. Requiere que el usuario autenticado sea el propietario de la cuenta o tenga los permisos adecuados para acceder a ella.
- **Autenticación**: Requerida (Token Bearer). Utiliza un hook `requireAuth` pasado en las opciones del plugin.
- **Tags**: `Accounts`
- **Parámetros de Ruta**:
    - `accountId` (string, obligatorio): ID de la cuenta para la cual se desea obtener el saldo.
        - *Ejemplo*: `acc_67890`
- **Respuestas**:
    - `200 OK`: Saldo de la cuenta obtenido con éxito.
        - **Cuerpo**: `AccountBalanceSchema` (ver Schemas Comunes).
    - `400 Bad Request`: ID de cuenta inválido (aunque generalmente esto sería un 404 si no se encuentra).
        - **Cuerpo**: `ErrorResponseSchema` (ver Schemas Comunes).
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `403 Forbidden`: El usuario autenticado no tiene permiso para acceder a esta cuenta.
        - **Cuerpo**: `ErrorResponseSchema`. *Mensaje*: `"No tienes permiso para acceder a esta cuenta"`.
    - `404 Not Found`: No se encontró el perfil del usuario o la cuenta especificada.
        - **Cuerpo**: `ErrorResponseSchema`. *Mensajes*: `"Perfil de usuario no encontrado"`, `"Cuenta no encontrada"`.
    - `500 Internal Server Error`: Error inesperado en el servidor, por ejemplo, al verificar la propiedad de la cuenta o al obtener el saldo.
        - **Cuerpo**: `ErrorResponseSchema`. *Mensaje*: `"Error al verificar la propiedad de la cuenta"` o `"Ocurrió un error al recuperar el saldo de la cuenta"`.
- **Lógica Principal**:
    1.  **Autenticación**: El hook `requireAuth` se ejecuta para asegurar la autenticación.
    2.  Obtiene el `accountId` de los parámetros de la ruta y el `userId` del token JWT (`request.user.sub`).
    3.  **Verificación de Propiedad de la Cuenta** (función `verifyAccountOwnership`):
        a.  Busca el `profileId` del `userId` en la tabla `profiles`.
        b.  Si el perfil no se encuentra, responde con 404.
        c.  Busca la cuenta por `accountId` en la tabla `accounts`.
        d.  Si la cuenta no se encuentra, responde con 404.
        e.  Compara el `profileId` de la cuenta encontrada con el `profileId` del usuario autenticado. Si no coinciden, responde con 403.
    4.  Si la verificación de propiedad es exitosa:
        a.  Obtiene la `currency` de la cuenta desde la base de datos.
        b.  Llama a `accountService.getAccountBalance(accountId)` para obtener el saldo.
        c.  Responde con el saldo y la moneda.

### 2. Obtener Movimientos del Libro Mayor de la Cuenta (Ledger)
- **Método**: `GET`
- **URL**: `/accounts/{accountId}/ledger` (o `/api/accounts/{accountId}/ledger` con prefijo global)
- **Descripción General**: Recupera una lista de los movimientos (asientos del libro mayor) para una cuenta específica. Requiere que el usuario autenticado sea el propietario de la cuenta.
- **Autenticación**: Requerida (Token Bearer). Utiliza el hook `requireAuth`.
- **Tags**: `Accounts`
- **Parámetros de Ruta**:
    - `accountId` (string, obligatorio): ID de la cuenta para la cual se desean obtener los movimientos del ledger.
        - *Ejemplo*: `acc_67890`
- **Respuestas**:
    - `200 OK`: Movimientos del ledger obtenidos con éxito.
        - **Cuerpo**: Array de `LedgerEntrySchema` (ver Schemas Comunes). `[LedgerEntrySchema, ...]`
    - `400 Bad Request`: ID de cuenta inválido.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `403 Forbidden`: El usuario autenticado no tiene permiso para acceder a esta cuenta.
        - **Cuerpo**: `ErrorResponseSchema`. *Mensaje*: `"No tienes permiso para acceder a esta cuenta"`.
    - `404 Not Found`: No se encontró el perfil del usuario o la cuenta especificada.
        - **Cuerpo**: `ErrorResponseSchema`. *Mensajes*: `"Perfil de usuario no encontrado"`, `"Cuenta no encontrada"`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`. *Mensaje*: `"Ocurrió un error al recuperar los asientos del libro mayor"`.
- **Lógica Principal**:
    1.  **Autenticación**: El hook `requireAuth` se ejecuta.
    2.  Obtiene el `accountId` de los parámetros de la ruta y el `userId` del token JWT.
    3.  **Verificación de Propiedad de la Cuenta**: Misma lógica que para el endpoint de saldo (`verifyAccountOwnership`).
    4.  Si la verificación de propiedad es exitosa:
        a.  Llama a `accountService.getAccountLedgerEntries(accountId)` para obtener la lista de movimientos.
        b.  Mapea los resultados (especialmente las fechas como `transactionDate` y `createdAt`) al formato esperado por `LedgerEntrySchema` (ej. ISO 8601 string).
        c.  Responde con la lista de movimientos del ledger.

## Schemas Comunes

### `AccountBalanceSchema`
Define la estructura de la respuesta para el saldo de una cuenta.
- `balance` (number): El saldo actual de la cuenta (en unidad mayor, ej. pesos).
- `currency` (string): Código de moneda de la cuenta (ej. `"MXN"`, `"USD"`).
    - *Valores posibles*: `MXN`, `USD` (según la enumeración en el schema).

### `LedgerEntrySchema`
Define la estructura para un asiento individual del libro mayor.
- `id` (string): ID único del asiento del ledger.
- `accountId` (string): ID de la cuenta a la que pertenece este asiento.
- `direction` (string): Dirección del movimiento financiero.
    - *Valores posibles*: `DEBIT`, `CREDIT`.
- `amount` (number): Monto del asiento (en unidad mayor).
- `entryType` (string): Tipo de asiento del ledger.
    - *Valores posibles*: `DISBURSEMENT`, `REPAYMENT`, `FEE_APPLIED`, `INTEREST_ACCRUED`, `PAYMENT_ADJUSTMENT`, `CAPITALIZATION`.
- `referenceId` (string, opcional): ID de referencia a otra entidad relacionada (ej. ID del pago, ID del desembolso).
- `requestId` (string, opcional): ID de una solicitud original que generó este asiento.
- `transactionDate` (string): Fecha y hora en que ocurrió la transacción, en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- `description` (string, opcional): Descripción legible del asiento.
- `createdAt` (string): Fecha y hora de creación del asiento en el sistema, en formato ISO 8601.

### `ErrorResponseSchema`
Schema genérico para respuestas de error en este servicio.
- `statusCode` (number): Código de estado HTTP.
- `error` (string): Breve descripción del tipo de error (ej. `"Not Found"`, `"Forbidden"`).
- `message` (string): Mensaje de error detallado, legible por humanos.

--- 