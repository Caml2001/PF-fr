# Guía de API de Rutas Protegidas

Esta guía explica cómo interactuar con el sistema de rutas protegidas desde el punto de vista de la API. Está dirigida principalmente a desarrolladores frontend y a quienes integran con la API de PrestaFirme.

## Índice

1. [Introducción](#introducción)
2. [Tokens de Acceso](#tokens-de-acceso)
3. [Códigos de Estado HTTP](#códigos-de-estado-http)
4. [Errores de Acceso](#errores-de-acceso)
5. [Niveles de Acceso y Estados](#niveles-de-acceso-y-estados)
6. [Referencias por Ruta](#referencias-por-ruta)
7. [Actualización de Tokens](#actualización-de-tokens)
8. [Integración con Aplicaciones](#integración-con-aplicaciones)

## Introducción

La API de PrestaFirme utiliza un sistema de control de acceso basado en el estado del usuario para determinar qué rutas son accesibles. Estos estados incluyen:

- **Estado de onboarding**: Dónde se encuentra el usuario en el proceso de registro
- **Estado de cuenta**: Si la cuenta está activa, inactiva, suspendida, etc.
- **Rol del usuario**: Usuario regular o administrador

## Tokens de Acceso

### Tipos de Tokens

La API utiliza dos tokens diferentes:

1. **Token de Supabase**: Para autenticación con Supabase
   - Generado por Supabase Auth
   - Se usa para interactuar con servicios de Supabase

2. **Token JWT Mejorado**: Para acceso a rutas protegidas
   - Contiene estado de onboarding, cuenta y rol
   - Optimizado para verificaciones de acceso rápidas

### Obtención de Tokens

Ambos tokens se obtienen al iniciar sesión:

```http
POST /auth/signin
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

Respuesta:

```json
{
  "user": {
    "id": "1234-5678-90ab-cdef",
    "email": "usuario@ejemplo.com",
    "...": "..."
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "...": "..."
  },
  "enhancedToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Uso de Tokens

Para acceder a rutas protegidas, incluye el token mejorado en el encabezado `Authorization`:

```http
GET /api/loans
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Códigos de Estado HTTP

El sistema de rutas protegidas utiliza los siguientes códigos de estado:

| Código | Significado | Causa |
|--------|-------------|-------|
| 200 | OK | Acceso concedido |
| 401 | Unauthorized | Token faltante, inválido o expirado |
| 403 | Forbidden | Token válido, pero permisos insuficientes |
| 503 | Service Unavailable | Circuit breaker activo (falla temporal) |

## Errores de Acceso

### Formato de Error

Las respuestas de error incluyen información detallada para guiar al cliente:

```json
{
  "error": "Forbidden",
  "reason": "Insufficient onboarding status",
  "code": "INSUFFICIENT_ONBOARDING",
  "onboarding": "PROFILE_PENDING"
}
```

### Códigos de Error

Los principales códigos de error son:

| Código | Significado | Acción Recomendada |
|--------|-------------|-------------------|
| `INSUFFICIENT_ONBOARDING` | Estado de onboarding insuficiente | Dirigir al usuario a completar el onboarding |
| `INSUFFICIENT_ACCOUNT` | Estado de cuenta insuficiente | Informar al usuario sobre el estado de su cuenta |
| `INSUFFICIENT_ROLE` | Rol insuficiente | Mostrar error de permisos |
| `TOKEN_REVOKED` | Token revocado o versión antigua | Solicitar al usuario que vuelva a iniciar sesión |
| `EXPLICIT_DENY` | Acceso explícitamente denegado | Mostrar error de permisos |
| `NO_MATCHING_RULE` | No existe regla para esta ruta | Mostrar error de permisos |

## Niveles de Acceso y Estados

### Estados de Onboarding

Los estados de onboarding determinan el progreso del usuario en el proceso de registro:

| Estado | Descripción | Acceso a |
|--------|-------------|----------|
| `NEW` | Usuario recién registrado | Onboarding básico |
| `PHONE_PENDING` | Pendiente verificación de teléfono | Verificación de teléfono |
| `OTP_PENDING` | Pendiente verificación OTP | Verificación OTP |
| `REGISTERED_BASIC` | Registro básico completado | Formulario de perfil |
| `PROFILE_PENDING` | Perfil en proceso | Carga de documentos |
| `INE_SUBMITTED` | INE enviado | Estado de verificación |
| `INE_REVIEW` | INE en revisión | Completar onboarding |
| `PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN` | Consentimiento de buró dado | Información limitada de préstamos |
| `PROFILE_COMPLETE_BUREAU_CONSENT_DENIED` | Consentimiento de buró negado | Información limitada |
| `DUMMY_BUREAU_CHECK_COMPLETED` | Verificación de buró completada | Ver préstamos |
| `CREDIT_REPORT_AVAILABLE_DUMMY` | Reporte de crédito disponible | Acceso total a préstamos |

### Estados de Cuenta

Los estados de cuenta determinan si el usuario puede realizar transacciones:

| Estado | Descripción | Acceso a |
|--------|-------------|----------|
| `INACTIVE` | Cuenta inactiva | Solo lectura |
| `ACTIVE` | Cuenta activa | Operaciones completas |
| `SUSPENDED` | Cuenta suspendida | Solo lectura limitada |
| `CLOSED` | Cuenta cerrada | Sin acceso |

### Roles de Usuario

Los roles determinan las capacidades administrativas:

| Rol | Descripción | Acceso a |
|-----|-------------|----------|
| `user` | Usuario regular | Funcionalidades de usuario |
| `admin` | Administrador | Panel de administración |

## Referencias por Ruta

### Rutas Públicas

Estas rutas son accesibles sin autenticación:

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/auth/signup` | POST | Registrar nuevo usuario |
| `/auth/signin` | POST | Iniciar sesión |
| `/docs/*` | GET | Documentación de API |
| `/health` | GET | Estado del servicio |

### Rutas de Onboarding

Estas rutas requieren autenticación y estados específicos de onboarding:

| Ruta | Método | Estados Requeridos | Descripción |
|------|--------|-------------------|-------------|
| `/onboarding/phone` | POST | `NEW`, `PHONE_PENDING` | Registrar teléfono |
| `/onboarding/verify-otp` | POST | `OTP_PENDING` | Verificar código OTP |
| `/onboarding/profile` | POST, PUT | `REGISTERED_BASIC`, `PROFILE_PENDING` | Actualizar perfil |
| `/onboarding/documents` | POST | `PROFILE_PENDING`, `INE_SUBMITTED`, `INE_REVIEW` | Subir documentos |
| `/onboarding/complete` | POST | `INE_REVIEW` | Completar onboarding |
| `/onboarding/status` | GET | *Cualquiera* | Verificar estado actual |

### Rutas de Préstamos

Estas rutas requieren onboarding completo:

| Ruta | Método | Estados Requeridos | Descripción |
|------|--------|-------------------|-------------|
| `/api/loans` | GET | `PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN`, `DUMMY_BUREAU_CHECK_COMPLETED`, `CREDIT_REPORT_AVAILABLE_DUMMY` | Listar préstamos |
| `/api/loans` | POST | `DUMMY_BUREAU_CHECK_COMPLETED`, `CREDIT_REPORT_AVAILABLE_DUMMY` + Cuenta `ACTIVE` | Solicitar préstamo |
| `/api/loans/:id` | GET | `PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN`, `DUMMY_BUREAU_CHECK_COMPLETED`, `CREDIT_REPORT_AVAILABLE_DUMMY` | Ver detalle de préstamo |

### Rutas de Administración

Estas rutas requieren rol de administrador:

| Ruta | Método | Rol Requerido | Descripción |
|------|--------|--------------|-------------|
| `/admin/*` | * | `admin` | Todas las rutas de administración |

## Actualización de Tokens

El token JWT mejorado se actualiza automáticamente cuando:

1. El estado de onboarding cambia
2. El estado de la cuenta cambia
3. El rol del usuario cambia

Los endpoints que cambian estos estados devuelven el nuevo token:

```json
{
  "success": true,
  "message": "Onboarding completado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Integración con Aplicaciones

### Flujo de Autenticación

1. **Iniciar sesión**: Obtener `enhancedToken` y `session.access_token`
2. **Almacenar tokens**: Guardar ambos tokens de forma segura
3. **Usar los tokens**: 
   - Para rutas de la API: Usar `enhancedToken`
   - Para servicios de Supabase: Usar `session.access_token`

### Manejo de Errores 403 (Forbidden)

Cuando recibas un error 403, verifica el código:

```javascript
async function callApi(url) {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getEnhancedToken()}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    if (response.status === 403) {
      const error = await response.json();
      handleAccessError(error);
    }
    
  } catch (error) {
    console.error('API error:', error);
  }
}

function handleAccessError(error) {
  switch (error.code) {
    case 'INSUFFICIENT_ONBOARDING':
      // Redirigir al flujo de onboarding adecuado
      navigateToOnboarding(error.onboarding);
      break;
    case 'INSUFFICIENT_ACCOUNT':
      // Mostrar mensaje sobre estado de cuenta
      showAccountStatusMessage(error.account);
      break;
    case 'INSUFFICIENT_ROLE':
      // Mostrar error de permisos
      showPermissionError();
      break;
    case 'TOKEN_REVOKED':
      // Solicitar nuevo inicio de sesión
      logout();
      navigateToLogin();
      break;
    default:
      // Error genérico
      showGenericError();
  }
}
```

### Actualización de Tokens

Cuando recibas un nuevo token, actualiza el almacenado:

```javascript
function handleApiResponse(response) {
  // Si la respuesta incluye un nuevo token, actualizarlo
  if (response.token) {
    localStorage.setItem('enhancedToken', response.token);
  }
  
  // Continuar con el procesamiento normal
  return response;
}
```

### Manejo de Cierre de Sesión

Al cerrar sesión, elimina ambos tokens:

```javascript
async function logout() {
  try {
    // Llamar al endpoint de cierre de sesión
    await fetch('/auth/signout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getEnhancedToken()}` }
    });
  } catch (error) {
    console.error('Error durante logout:', error);
  } finally {
    // Siempre limpiar tokens localmente
    localStorage.removeItem('enhancedToken');
    localStorage.removeItem('supabaseToken');
    // Redirigir a login
    window.location.href = '/login';
  }
}
```