# Documentación Detallada del Servicio: Préstamos (Loans)

Este documento detalla cada uno de los endpoints gestionados por el servicio de Préstamos (`loans.ts`). Está diseñado para servir como referencia técnica exhaustiva tanto para el equipo de backend como para el equipo de frontend.

**Nota sobre Prefijos**: La URL base para estos endpoints puede estar prefijada con `/api` (ej. `/api/loans`) si así está configurado globalmente en el servidor. La documentación aquí omite este prefijo global, mostrando la ruta tal como se define en el archivo `loans.ts`.

## Endpoints

### 1. Listar Productos de Préstamo Disponibles
- **Método**: `GET`
- **URL**: `/loan-products` (o `/api/loan-products` con prefijo global)
- **Descripción General**: Obtiene un listado de todos los productos de préstamo disponibles. No requiere autenticación.
- **Autenticación**: No requerida.
- **Tags**: `Loans`
- **Respuestas**:
    - `200 OK`: Listado de productos recuperado con éxito.
        - **Cuerpo**: Array de objetos con los siguientes campos:
            - `id` (string): ID único del producto de préstamo.
            - `name` (string): Nombre del producto.
            - `productType` (string): Tipo de producto, ej. 'simple', 'revolvente', 'back_to_back', 'express'.
            - `ratePeriodicity` (string): Periodicidad de la tasa de interés.
            - `rateDefinitionPeriodicity` (string): Periodicidad de definición de la tasa.
            - `minRate` (number): Tasa mínima de interés.
            - `maxRate` (number): Tasa máxima de interés.
            - `commissionRate` (number): Tasa de comisión.
            - `lateFeeRate` (number): Tasa de recargo por atraso.
            - `minAmount` (number): Monto mínimo que se puede solicitar.
            - `maxAmount` (number): Monto máximo que se puede solicitar.
            - `fixedTerm` (number, opcional): Número fijo de períodos para productos con plazo predefinido.
            - `isExpressProduct` (boolean): Indica si es un producto de tipo express con plazo fijo.
            - `createdAt` (string): Fecha de creación del producto en formato ISO 8601.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.

### 2. Crear Nuevo Producto de Préstamo (Admin)
- **Método**: `POST`
- **URL**: `/loan-products` (o `/api/loan-products` con prefijo global)
- **Descripción General**: Permite a un administrador crear un nuevo producto de préstamo. Requiere autenticación y rol de administrador.
- **Autenticación**: Requerida (Token Bearer) + Rol de Administrador.
- **Tags**: `Loans`, `Admin`
- **Cuerpo de la Solicitud (`application/json`)**:
    - *Ejemplo (Préstamo Personal Estándar)*:
      ```json
      {
        "name": "Préstamo Personal",
        "productType": "simple",
        "ratePeriodicity": "WEEKLY",
        "rateDefinitionPeriodicity": "WEEKLY",
        "minRate": 0.02,
        "maxRate": 0.02,
        "commissionRate": 0.03,
        "lateFeeRate": 0.01,
        "minAmount": 1000,
        "maxAmount": 50000
      }
      ```
    - *Ejemplo (Crédito Express con Plazo Fijo)*:
      ```json
      {
        "name": "Crédito Express 2 Semanas",
        "productType": "express",
        "ratePeriodicity": "WEEKLY",
        "rateDefinitionPeriodicity": "WEEKLY",
        "minRate": 0.0145,
        "maxRate": 0.023,
        "commissionRate": 0.02,
        "lateFeeRate": 0.05,
        "minAmount": 500,
        "maxAmount": 7000,
        "fixedTerm": 2
      }
      ```
- **Respuestas**:
    - `201 Created`: Producto creado con éxito.
        - **Cuerpo**: Los detalles del producto creado.
    - `400 Bad Request`: Error de validación en la solicitud.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `403 Forbidden`: El usuario no tiene permisos de administrador.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.

### 3. Solicitar Cotización de Préstamo
- **Método**: `POST`
- **URL**: `/loans/quote` (o `/api/loans/quote` con prefijo global)
- **Descripción General**: Calcula y devuelve una cotización de préstamo basada en los parámetros proporcionados, incluyendo la tabla de amortización.
- **Autenticación**: No requerida.
- **Tags**: `Loans`
- **Cuerpo de la Solicitud (`application/json`)**: 
    - *Ejemplo*:
      ```json
      {
        "productId": "prod_12345",
        "amount": 10000.00,
        "term": 12, // Plazo en 12 periodos (ej. semanas/meses según producto)
        // "payment": 900.00, // Alternativamente, se podría proveer payment en lugar de term
        "startDate": "2024-08-01T00:00:00Z" // Opcional
      }
      ```
- **Respuestas**:
    - `200 OK`: Cotización calculada con éxito.
        - **Cuerpo**: Objeto con `quote` (detalles del préstamo cotizado) y `schedule` (tabla de amortización).
    - `400 Bad Request`: Error de validación en la solicitud.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `404 Not Found`: Producto no encontrado.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.

### 4. Obtener Lista de Préstamos del Usuario
- **Método**: `GET`
- **URL**: `/loans` (o `/api/loans` con prefijo global)
- **Descripción General**: Permite a un usuario autenticado obtener todos sus préstamos, tanto activos como inactivos. Este endpoint requiere que el usuario tenga un límite de crédito disponible (mayor a 0).
- **Autenticación**: Requerida (Token Bearer). Utiliza un hook `requireAuth` pasado en las opciones del plugin.
- **Tags**: `Loans`
- **Respuestas**:
    - `200 OK`: Lista de préstamos recuperada con éxito.
        - **Cuerpo**: Array de objetos con los siguientes campos:
            - `id` (string): ID único del préstamo.
            - `borrowerId` (string): ID del perfil del prestatario.
            - `accountId` (string): ID de la cuenta asociada al préstamo.
            - `productId` (string): ID del producto de préstamo.
            - `productType` (string, puede ser null): Tipo de producto (simple, revolvente, express, etc.).
            - `productName` (string, puede ser null): Nombre del producto asociado.
            - `principal` (number): Monto principal del préstamo.
            - `term` (integer): Plazo del préstamo en número de periodos.
            - `rateApplied` (number): Tasa de interés aplicada.
            - `ratePeriodicity` (string): Periodicidad de la tasa.
            - `commissionAmount` (number, puede ser null): Monto de la comisión.
            - `status` (string): Estado actual del préstamo (ej. ACTIVE, PAID_OFF).
            - `startDate` (string, puede ser null): Fecha de inicio del préstamo en formato ISO 8601.
            - `expectedEndDate` (string, puede ser null): Fecha esperada de finalización en formato ISO 8601.
            - `createdAt` (string): Fecha de creación del préstamo en formato ISO 8601.
            - `isExpressProduct` (boolean): Indica si es un producto de tipo express.
            - `fixedTerm` (number, puede ser null): Número de períodos fijos si es un producto express.
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `403 Forbidden`: El usuario no tiene un límite de crédito disponible.
        - **Cuerpo**: `ErrorResponseSchema`.
        - *Ejemplo de Mensaje*: `"You do not have a credit limit available to view loans"` (con `reason: 'NO_CREDIT_LIMIT'`).
    - `404 Not Found`: Perfil de usuario no encontrado.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.
- **Lógica Principal**:
    1. **Autenticación**: El hook `requireAuth` se ejecuta primero para asegurar que el usuario esté autenticado.
    2. Obtiene el `userId` del token JWT (`request.user.sub`).
    3. Busca el `profileId` del usuario en la tabla `profiles` usando el `userId`.
    4. Si el perfil no existe, responde con error 404.
    5. Verifica si el usuario tiene un límite de crédito disponible usando `loanService.getAvailableCredit(profileId)`.
    6. Si el límite de crédito es <= 0, responde con error 403 (`NO_CREDIT_LIMIT`).
    7. Obtiene todos los préstamos del usuario llamando a `loanService.findByBorrowerId(profileId)`.
    8. Formatea los datos de los préstamos para la respuesta, convirtiendo objetos Money a números.
    9. Responde con código 200 y la lista formateada de préstamos.

### 5. Solicitar un Nuevo Préstamo
- **Método**: `POST`
- **URL**: `/loans` (o `/api/loans` con prefijo global)
- **Descripción General**: Permite a un usuario autenticado y con perfil existente solicitar un nuevo préstamo. El usuario debe especificar un producto de préstamo, el monto principal deseado, y alternativamente el plazo del préstamo o el monto del pago periódico. Para productos de tipo "express", el plazo será determinado automáticamente por el campo `fixedTerm` del producto y no se permite especificar `paymentAmount`.
- **Autenticación**: Requerida (Token Bearer). Utiliza un hook `requireAuth` pasado en las opciones del plugin.
- **Tags**: `Loans`
- **Cuerpo de la Solicitud (`application/json`)**: `CreateLoanRequestBodySchema` (ver Schemas Comunes)
    - *Ejemplo para préstamo normal*:
      ```json
      {
        "productId": "prod_12345",
        "principal": 10000.00,
        "term": 12, // Plazo en 12 periodos (ej. semanas/meses según producto)
        // "paymentAmount": 900.00, // Alternativamente, se podría proveer paymentAmount en lugar de term
        "startDate": "2024-08-01T00:00:00Z" // Opcional
      }
      ```
    - *Ejemplo para préstamo express (con plazo fijo)*:
      ```json
      {
        "productId": "prod_express_1",
        "principal": 5000.00,
        // No se permite especificar paymentAmount para productos express
        // El term debe coincidir con el fixedTerm del producto o puede omitirse
        "startDate": "2024-08-01T00:00:00Z" // Opcional
      }
      ```
- **Respuestas**:
    - `201 Created`: Préstamo creado con éxito.
        - **Cuerpo**: `LoanResponseSchema` (ver Schemas Comunes). Contiene los detalles del préstamo creado.
    - `400 Bad Request`: Error de validación en la solicitud.
        - **Cuerpo**: `ErrorResponseSchema` (ver Schemas Comunes).
        - *Ejemplos de Mensajes*:
            - `"Must provide either term or paymentAmount, but not both."`
            - `"Para productos express con plazo fijo, el término debe ser exactamente X periodos."`
            - `"Para productos express con plazo fijo, no se permite especificar el monto de pago (paymentAmount)."`
            - Mensajes de error de validación de campos (ej. `principal` debe ser mayor a 0).
            - `"Error de validación"` (genérico si `error.code === 'VALIDATION_ERROR'`).
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `404 Not Found`: Recurso no encontrado.
        - **Cuerpo**: `ErrorResponseSchema`.
        - *Ejemplos de Mensajes*:
            - `"Perfil de usuario no encontrado. Asegúrate de completar tu perfil."`
            - `"Producto no encontrado"` (si el `productId` no existe o `error.code === 'PRODUCT_NOT_FOUND'`).
    - `422 Unprocessable Entity`: No se puede procesar la entidad debido a una condición de negocio.
        - **Cuerpo**: `ErrorResponseSchema`.
        - *Ejemplo de Mensaje*: `"Insufficient credit available"` (con `reason: 'INSUFFICIENT_CREDIT'`).
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.
- **Lógica Principal**:
    1.  **Autenticación**: El hook `requireAuth` se ejecuta primero para asegurar que el usuario esté autenticado.
    2.  **Validación Inicial**: Verifica que se proporcione `term` o `paymentAmount`, pero no ambos.
    3.  Obtiene el `userId` del token JWT (`request.user.sub`).
    4.  Busca el `profileId` del usuario en la tabla `profiles` usando el `userId`.
    5.  Si el perfil no existe, responde con error 404.
    6.  Obtiene los detalles del producto de préstamo (`loanProducts`) usando el `productId` de la solicitud para determinar `ratePeriodicity` y otras propiedades del producto.
    7.  Si el producto no existe, responde con error 404.
    8.  Construye un DTO (`createLoanDto`) con los datos de la solicitud y del producto, convirtiendo el `principal` a unidades menores (ej. centavos).
    9.  Llama a `loanService.requestLoan(profileId, createLoanDto)` para procesar la solicitud del préstamo. Este servicio internamente manejará:
        -  Cálculos de intereses, comisiones.
        -  Verificación de línea de crédito disponible para el `profileId`.
        -  Creación del registro del préstamo en la base de datos.
        -  Generación de un plan de pagos (amortización).
    10. Si `loanService.requestLoan` lanza un error (ej. `PRODUCT_NOT_FOUND`, `VALIDATION_ERROR`, crédito insuficiente), se captura y se mapea a la respuesta HTTP correspondiente.
    11. Mapea la entidad `Loan` devuelta por el servicio a la estructura de `LoanResponseSchema`, convirtiendo valores monetarios de `Money` objects (unidades menores) a números de unidad mayor para la respuesta (ej. `principal.toMajorUnitNumber()`).
    12. Responde con el código 201 y los detalles del préstamo creado.

### 6. Obtener Detalles de un Préstamo
- **Método**: `GET`
- **URL**: `/loans/:id` (o `/api/loans/:id` con prefijo global)
- **Descripción General**: Obtiene los detalles completos de un préstamo específico.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Loans`
- **Parámetros de Ruta**:
    - `id` (string): ID único del préstamo a consultar.
- **Respuestas**:
    - `200 OK`: Préstamo recuperado con éxito.
        - **Cuerpo**: `LoanResponseSchema` (ver Schemas Comunes). Contiene los detalles del préstamo.
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `403 Forbidden`: El usuario no tiene acceso a este préstamo.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `404 Not Found`: Préstamo no encontrado.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.

### 7. Obtener Tabla de Amortización
- **Método**: `GET`
- **URL**: `/loans/:id/schedule` (o `/api/loans/:id/schedule` con prefijo global)
- **Descripción General**: Obtiene la tabla de amortización completa de un préstamo específico.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Loans`
- **Parámetros de Ruta**:
    - `id` (string): ID único del préstamo a consultar.
- **Respuestas**:
    - `200 OK`: Tabla de amortización recuperada con éxito.
        - **Cuerpo**: Array de objetos `ScheduleItemResponseSchema` (ver Schemas Comunes).
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `403 Forbidden`: El usuario no tiene acceso a este préstamo.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `404 Not Found`: Préstamo no encontrado.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.

### 8. Registrar Pago
- **Método**: `POST`
- **URL**: `/loans/:id/payments` (o `/api/loans/:id/payments` con prefijo global)
- **Descripción General**: Registra un pago para un préstamo específico. Puede usarse como webhook para STP.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Loans`, `Payments`
- **Parámetros de Ruta**:
    - `id` (string): ID único del préstamo para el que se realiza el pago.
- **Cuerpo de la Solicitud (`application/json`)**:
    - *Ejemplo*:
      ```json
      {
        "amountMinor": 100000, // 1000.00 pesos en centavos
        "amount": 1000.00, // Alternativa: monto en pesos (tiene precedencia sobre amountMinor)
        "method": "stp", // Opciones: "stp", "codi", "cash", "other"
        "requestId": "payment-20230509-001", // Identificador único para idempotencia
        "reference": "REF12345", // Opcional: referencia externa
        "paymentDate": "2023-05-09T14:30:00Z" // Opcional: fecha del pago
      }
      ```
- **Respuestas**:
    - `200 OK`: Pago procesado con éxito.
        - **Cuerpo**: Objeto con detalles del pago, balance después del pago y mensaje.
    - `400 Bad Request`: Error de validación en la solicitud.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `403 Forbidden`: El usuario no tiene acceso a este préstamo.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `404 Not Found`: Préstamo no encontrado.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.

### 9. Obtener Cargos de un Préstamo
- **Método**: `GET`
- **URL**: `/loans/:id/charges` (o `/api/loans/:id/charges` con prefijo global)
- **Descripción General**: Obtiene todos los cargos (comisiones, recargos, etc.) asociados a un préstamo.
- **Autenticación**: Requerida (Token Bearer).
- **Tags**: `Loans`
- **Parámetros de Ruta**:
    - `id` (string): ID único del préstamo a consultar.
- **Respuestas**:
    - `200 OK`: Cargos recuperados con éxito.
        - **Cuerpo**: Array de objetos con detalles de los cargos.
    - `401 Unauthorized`: Autenticación requerida o fallida.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `403 Forbidden`: El usuario no tiene acceso a este préstamo.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `404 Not Found`: Préstamo no encontrado.
        - **Cuerpo**: `ErrorResponseSchema`.
    - `500 Internal Server Error`: Error inesperado en el servidor.
        - **Cuerpo**: `ErrorResponseSchema`.

## Schemas Comunes

### `CreateLoanRequestBodySchema`
Define la estructura para la solicitud de creación de un nuevo préstamo.
- `productId` (string, obligatorio): ID del producto de préstamo seleccionado.
- `principal` (number, obligatorio): Monto principal solicitado. Debe ser mayor a 0.00.
- `term` (integer, opcional): Plazo del préstamo en número de periodos (ej. semanas, meses, según defina el producto). Mínimo 1. *Nota: Se debe proveer `term` O `paymentAmount`.*
- `paymentAmount` (number, opcional): Monto del pago fijo por periodo. Mínimo 0.01. *Nota: Se debe proveer `term` O `paymentAmount`.*
- `startDate` (string, opcional): Fecha de inicio deseada para el préstamo, en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### `LoanResponseSchema`
Define la estructura de la respuesta para un préstamo creado o recuperado.
- `id` (string): ID único del préstamo.
- `borrowerId` (string): ID del perfil del prestatario (referencia a `profiles.id`).
- `productId` (string): ID del producto de préstamo asociado.
- `principal` (number): Monto principal del préstamo (en unidad mayor, ej. pesos).
- `term` (integer): Plazo del préstamo en número de periodos.
- `rateApplied` (number): Tasa de interés aplicada al préstamo (decimal, ej. 0.05 para 5%).
- `ratePeriodicity` (string): Periodicidad de la tasa (ej. `WEEKLY`, `MONTHLY`).
- `commissionAmount` (number, puede ser null): Monto de la comisión aplicada (en unidad mayor).
- `status` (string): Estado actual del préstamo (ej. `PENDING_DISBURSEMENT`, `ACTIVE`, `PAID_OFF`).
- `startDate` (string): Fecha de inicio real del préstamo en formato ISO 8601.
- `expectedEndDate` (string): Fecha esperada de finalización del préstamo en formato ISO 8601.
- `schedule` (array, opcional): Tabla de amortización del préstamo (array de `ScheduleItemResponseSchema`).

### `ScheduleItemResponseSchema`
Define la estructura de un elemento de la tabla de amortización.
- `id` (number): ID único del elemento de la tabla.
- `loanId` (string): ID del préstamo al que pertenece.
- `periodIndex` (number): Índice del periodo (1, 2, 3, ...).
- `dueDate` (string): Fecha de vencimiento del pago en formato ISO 8601.
- `principalDue` (number): Monto de principal a pagar.
- `interestDue` (number): Monto de interés a pagar.
- `feeDue` (number): Monto de cargos a pagar.
- `principalPaid` (number): Monto de principal ya pagado.
- `interestPaid` (number): Monto de interés ya pagado.
- `feePaid` (number): Monto de cargos ya pagados.
- `paid` (boolean): Indica si el pago está completamente pagado.
- `partiallyPaid` (boolean): Indica si el pago está parcialmente pagado.
- `totalDue` (number): Monto total a pagar (principal + interés + cargos).
- `totalPaid` (number): Monto total ya pagado.
- `remainingDue` (number): Monto restante por pagar.
- `balance` (number): Saldo del préstamo después de este pago.

### `ErrorResponseSchema`
Schema genérico para respuestas de error en este servicio.
- `statusCode` (number): Código de estado HTTP.
- `error` (string): Breve descripción del tipo de error (ej. `"Not Found"`, `"Bad Request"`).
- `message` (string): Mensaje de error detallado, legible por humanos.
- `reason` (string, opcional): Un código o identificador más específico para el error, útil para el frontend (ej. `"INSUFFICIENT_CREDIT"`).

--- 