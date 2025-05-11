# Integración de Buró de Crédito (Simulado)

## Descripción General

Esta documentación detalla la implementación de la consulta simulada al Buró de Crédito en la plataforma. Esta simulación permite:

1. Recopilar el consentimiento del usuario para la consulta al buró
2. Simular la consulta al buró usando datos del perfil del usuario
3. Guardar el resultado en la base de datos
4. Utilizar el resultado en el flujo de solicitud de préstamos

La implementación actual utiliza datos simulados, pero está diseñada para facilitar la transición a una integración real con el Buró de Crédito en el futuro.

## Diagrama del Flujo

```
┌─────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│ Perfil completo │────▶│ Consentimiento al  │────▶│ Consulta al buró │
│                 │     │ buró (sí/no)       │     │ simulada         │
└─────────────────┘     └────────────────────┘     └──────────────────┘
                                                            │
                                                            ▼
┌─────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│ Solicitud de    │◀────│ Score crediticio   │◀────│ Almacenamiento   │
│ préstamo        │     │ disponible         │     │ en base de datos │
└─────────────────┘     └────────────────────┘     └──────────────────┘
```

## Endpoints Relacionados

### 1. Completar Perfil y Dar Consentimiento al Buró

- **Método**: `POST`
- **URL**: `/onboarding/complete`
- **Descripción**: Verifica que el perfil del usuario esté completo, registra su consentimiento para la consulta al buró de crédito, y si consiente, realiza la consulta simulada al buró inmediatamente.
- **Autenticación**: Requerida (Token Bearer)
- **Cuerpo de la Solicitud**:
  ```json
  {
    "consentToBureauCheck": true  // o false
  }
  ```
- **Respuestas**:
  - `200 OK`: Perfil validado y consentimiento registrado
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
  - `400 Bad Request`: Perfil incompleto
    ```json
    {
      "success": false,
      "error": "Información incompleta",
      "missingFields": ["curp", "ineBackUrl", ...]  // Campos faltantes
    }
    ```
  - `404 Not Found`: Perfil no encontrado
  - `500 Internal Server Error`: Error en el procesamiento

- **Flujo Completo**:
  1. Verifica que el perfil del usuario esté completo (datos personales, dirección, identificación)
  2. Registra la decisión del usuario sobre el consentimiento para consulta al buró
  3. Si el usuario otorga consentimiento:
     - Realiza inmediatamente la consulta simulada al buró
     - Guarda el resultado en la base de datos
     - Actualiza el estado de onboarding a `DUMMY_BUREAU_CHECK_COMPLETED`
     - Incluye un resumen del reporte crediticio en la respuesta
  4. Si el usuario no otorga consentimiento:
     - Actualiza el estado a `PROFILE_COMPLETE_BUREAU_CONSENT_DENIED`
     - No se realiza ninguna consulta al buró

### 2. Solicitud de Préstamo (integración con buró)

- **Método**: `POST`
- **URL**: `/loans`
- **Comportamiento con relación al buró**:
  - Verifica el estado de onboarding y la existencia de un reporte de buró:
    - Si el usuario dio consentimiento pero no tiene reporte (estado `PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN`):
      - Genera un reporte simulado
      - Actualiza el estado a `DUMMY_BUREAU_CHECK_COMPLETED`
    - Si el usuario negó el consentimiento (`PROFILE_COMPLETE_BUREAU_CONSENT_DENIED`):
      - Rechaza la solicitud con código 403
    - Si el usuario ya tiene un reporte (`DUMMY_BUREAU_CHECK_COMPLETED` o `CREDIT_REPORT_AVAILABLE_DUMMY`):
      - Procede con la solicitud de préstamo
    - Si el usuario está en otro estado de onboarding:
      - Rechaza la solicitud con código 403

## Estados de Onboarding Relacionados con el Buró

- `PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN`: El usuario ha completado su perfil y ha otorgado consentimiento para la consulta al buró. Este estado normalmente será transitorio, ya que inmediatamente se realizará la consulta.

- `PROFILE_COMPLETE_BUREAU_CONSENT_DENIED`: El usuario ha completado su perfil pero ha negado el consentimiento para la consulta al buró. En este estado, el usuario no podrá solicitar préstamos.

- `DUMMY_BUREAU_CHECK_COMPLETED`: Se ha realizado la consulta simulada al buró y se ha guardado el reporte. El usuario puede solicitar préstamos.

- `CREDIT_REPORT_AVAILABLE_DUMMY`: Estado reservado para futuros usos, indicando que hay un reporte de buró disponible y válido.

## Servicio de Simulación de Buró de Crédito

La funcionalidad principal de la consulta simulada está implementada en `CreditBureauService`:

### Método: `fetchAndSaveDummyCreditReport`

Este método es el corazón de la simulación:

1. **Entrada**: ID del perfil y datos del perfil del usuario
2. **Proceso**:
   - Genera una solicitud simulada con los datos del perfil
   - Crea una respuesta simulada con un score crediticio aleatorio
   - Mapea la respuesta al esquema de `credit_reports`
   - Guarda el reporte en la base de datos
3. **Salida**: El reporte de crédito guardado en la base de datos

### Método: `getLatestCreditReport`

Recupera el reporte de crédito más reciente para un perfil específico.

### Método: `hasRecentCreditReport`

Verifica si existe un reporte de crédito reciente (dentro de los últimos N días) para un perfil.

## Base de Datos: Esquema `credit_reports`

Los reportes de buró simulados se almacenan en la tabla `credit_reports` con la siguiente estructura:

- `id`: UUID, identificador único del reporte
- `profileId`: UUID, referencia al perfil del usuario
- `folioConsulta`: Folio único de la consulta al buró
- `fechaConsulta`: Fecha y hora de la consulta
- `fuente`: Origen del reporte (default: 'DUMMY_BUREAU')
- `personaNombreCompleto`: Nombre completo del usuario
- `personaRfc`: RFC del usuario
- `personaFechaNacimiento`: Fecha de nacimiento del usuario
- `personaDomicilio`: Objeto JSON con los detalles del domicilio
- `scoreValor`: Valor numérico del score crediticio
- `scoreRango`: Descripción del rango del score (BUENO, REGULAR, MALO)
- `creditosDetalle`: Array JSON con detalles de créditos previos
- `rawResponse`: Respuesta JSON completa y cruda del buró

## Preparación para Integración Real (Futura)

Esta implementación simulada prepara el terreno para una integración real con el Buró de Crédito en el futuro:

1. **Estructura de Datos Compatible**: El esquema de `credit_reports` y la estructura del reporte simulado siguen el formato real del Buró de Crédito.

2. **Flujo Completo de Consentimiento**: Se implementa el flujo completo de consentimiento del usuario, requisito legal para la consulta real.

3. **Separación de Servicios**: El servicio de buró está implementado de forma modular, permitiendo reemplazar el método de consulta simulada por uno real sin afectar el resto del sistema.

4. **Transición Suave**: Cuando se implemente la integración real, solo será necesario:
   - Actualizar el servicio de buró para conectarse a la API real
   - Añadir manejo de credenciales y seguridad para la API
   - Modificar el campo `fuente` a un valor como 'REAL_BUREAU_MX'

## Recomendaciones para el Frontend

- **Flujo de Consentimiento**: Presentar claramente al usuario la opción de consentimiento para la consulta al buró después de completar su perfil.
  
- **Visualización del Score**: Utilizar el campo `creditReport` en la respuesta de `/onboarding/complete` para mostrar al usuario su score crediticio inmediatamente después de dar consentimiento.

- **Ofertas Personalizadas**: Utilizar el score crediticio para personalizar las ofertas de préstamos mostradas al usuario.

- **Manejo de Rechazo de Consentimiento**: Informar adecuadamente al usuario que no podrá solicitar préstamos si no otorga consentimiento para la consulta al buró.

## Conclusión

La implementación simulada del Buró de Crédito proporciona una experiencia realista y completa mientras se prepara la integración con el servicio real. Al seguir las mejores prácticas y requisitos legales desde el principio, se facilita la transición futura y se asegura una experiencia de usuario consistente.