# POST /api/credit/application-submit

### Descripción
Recibe la solicitud de crédito de un usuario, incluyendo datos personales, documentos y preferencias de préstamo. Devuelve el estado inicial de la solicitud (preaprobada/rechazada/en revisión).

### Payload
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

### Response
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

### Validaciones
- userId válido y autenticado
- Datos personales completos y válidos
- Documentos cargados y legibles
- Monto y plazo dentro de rango permitido

### Errores posibles
- 401: Usuario no autenticado
- 422: Datos incompletos o inválidos
- 409: Solicitud ya existente en proceso

### Dependencias previas
- Usuario debe haber pasado buró de crédito
- Documentos deben estar previamente subidos

### Ejemplo de modelo de solicitud de crédito
```ts
{
  id: string;
  userId: string;
  amount: number;
  paymentTerm: number;
  personalData: {
    firstName: string;
    middleName: string;
    lastName: string;
    secondLastName: string;
    curp: string;
    address: {
      street: string;
      number: string;
      postalCode: string;
      city: string;
      state: string;
    };
  };
  documents: {
    ineDocumentUrl: string;
    addressDocumentUrl: string;
  };
  selectedAccount: string;
  status: 'preapproved' | 'rejected' | 'in_review';
  commission: number;
  amountToReceive: number;
  deadlineDate: string;
  createdAt: string;
}
```
