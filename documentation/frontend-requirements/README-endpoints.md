# Endpoints del Backend (Consolidado)

Este documento consolida todos los endpoints documentados para el backend del MVP PrestaFirme, agrupados por flujo.
Incluye ejemplos de payload (input) y respuesta (output) en JSON para cada endpoint principal.

---

## 1. Autenticación

- **POST /api/auth/signup**
  - Crea una nueva cuenta de usuario.
  - **Input:**
    ```json
    {
      "email": "usuario@ejemplo.com",
      "password": "stringMin8chars",
      "name": "Juan Pérez"
    }
    ```
  - **Output:**
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

- **POST /api/auth/login**
  - Autentica a un usuario existente.
  - **Input:**
    ```json
    {
      "email": "usuario@ejemplo.com",
      "password": "stringMin8chars"
    }
    ```
  - **Output:**
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

- **GET /api/auth/me**
  - Devuelve la información del usuario autenticado.
  - **Output:**
    ```json
    {
      "user": {
        "id": "uuid",
        "email": "usuario@ejemplo.com",
        "name": "Juan Pérez"
      }
    }
    ```

- **POST /api/auth/logout**
  - Cierra la sesión del usuario (invalida el token).
  - **Output:**
    ```json
    {
      "success": true
    }
    ```

---

## 2. Buró de Crédito

- **POST /api/credit-bureau/consent**
  - Registra el consentimiento explícito del usuario para consultar su buró de crédito.
  - **Input:**
    ```json
    {
      "userId": "uuid",
      "consent": true
    }
    ```
  - **Output:**
    ```json
    {
      "success": true,
      "timestamp": "2025-04-23T14:00:00Z"
    }
    ```

- **POST /api/credit-bureau/check**
  - Realiza la consulta del buró de crédito del usuario y devuelve el resultado.
  - **Input:**
    ```json
    {
      "userId": "uuid"
    }
    ```
  - **Output:**
    ```json
    {
      "result": "approved",
      "score": 720,
      "summary": "Sin adeudos relevantes. Historial positivo.",
      "details": {
        "openCredits": 2,
        "latePayments": 0,
        "maxDelayDays": 0
      },
      "checkedAt": "2025-04-23T14:10:00Z"
    }
    ```

---

## 3. Solicitud de Crédito

- **POST /api/credit/application-submit**
  - Recibe la solicitud de crédito de un usuario.
  - **Input:**
    ```json
    {
      "userId": "uuid",
      "amount": 2500,
      "paymentTerm": 14,
      "personalData": {
        "firstName": "Juan",
        "middleName": "Carlos",
        "lastName": "Pérez",
        "secondLastName": "López",
        "curp": "PEPJ800101HDFLLR01",
        "address": {
          "street": "Av. Reforma",
          "number": "123",
          "postalCode": "06000",
          "city": "CDMX",
          "state": "CDMX"
        }
      },
      "documents": {
        "ineDocumentUrl": "https://docs/ine/uuid.jpg",
        "addressDocumentUrl": "https://docs/address/uuid.pdf"
      },
      "selectedAccount": "cuenta1"
    }
    ```
  - **Output:**
    ```json
    {
      "applicationId": "uuid",
      "status": "preapproved",
      "commission": 37.5,
      "amountToReceive": 2462.5,
      "deadlineDate": "2025-04-28",
      "message": "Solicitud preaprobada. Falta revisión final."
    }
    ```

- **GET /api/credit/application-status**
  - Devuelve el estado actual de la solicitud de crédito del usuario.
  - **Output:**
    ```json
    {
      "applicationId": "uuid",
      "status": "preapproved",
      "commission": 37.5,
      "amountToReceive": 2462.5,
      "deadlineDate": "2025-04-28",
      "message": "Solicitud preaprobada. Falta revisión final."
    }
    ```

---

## 4. Documentos

- **POST /api/documents/upload**
  - Permite subir documentos requeridos (INE, comprobante de domicilio).
  - **Input:** (multipart/form-data)
    - userId: string
    - type: "ine" | "address"
    - file: archivo
  - **Output:**
    ```json
    {
      "documentUrl": "https://docs/ine/uuid.jpg",
      "type": "ine"
    }
    ```

- **GET /api/documents/:type**
  - Devuelve la URL y metadatos del documento subido por el usuario (INE o comprobante de domicilio).
  - **Output:**
    ```json
    {
      "documentUrl": "https://docs/ine/uuid.jpg",
      "type": "ine",
      "uploadedAt": "2025-04-23T14:00:00Z"
    }
    ```

---

## 5. Pagos

- **POST /api/payments/register**
  - Registra un pago realizado por el usuario para un crédito activo.
  - **Input:**
    ```json
    {
      "userId": "uuid",
      "applicationId": "uuid",
      "amount": 1500,
      "paymentDate": "2025-05-01",
      "paymentMethod": "transferencia"
    }
    ```
  - **Output:**
    ```json
    {
      "paymentId": "uuid",
      "status": "registered",
      "appliedAmount": 1500,
      "remainingBalance": 1000,
      "message": "Pago registrado correctamente."
    }
    ```

- **GET /api/payments/history**
  - Devuelve el historial de pagos realizados por el usuario.
  - **Output:**
    ```json
    {
      "payments": [
        {
          "paymentId": "uuid1",
          "amount": 1500,
          "paymentDate": "2025-05-01",
          "paymentMethod": "transferencia",
          "status": "registered"
        },
        {
          "paymentId": "uuid2",
          "amount": 1000,
          "paymentDate": "2025-05-15",
          "paymentMethod": "tarjeta",
          "status": "pending"
        }
      ]
    }
    ```

---

## 6. Cronograma de Pagos

- **GET /api/credit/payment-schedule**
  - Devuelve el cronograma de pagos para una solicitud de crédito específica.
  - **Output:**
    ```json
    {
      "applicationId": "uuid",
      "schedule": [
        {
          "dueDate": "2025-05-01",
          "amount": 1000,
          "status": "paid"
        },
        {
          "dueDate": "2025-05-15",
          "amount": 1500,
          "status": "pending"
        }
      ]
    }
    ```

---

### Notas
- Todos los endpoints requieren autenticación JWT, salvo los de registro y login.
- Los detalles de payload, respuesta y validaciones se encuentran en los archivos individuales de cada flujo.
- Para ejemplos y modelos de datos, ver los archivos `.md` correspondientes en cada subcarpeta.
