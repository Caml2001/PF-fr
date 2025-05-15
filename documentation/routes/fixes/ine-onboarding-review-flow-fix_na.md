# Informe de Corrección: Flujo de Revisión de INE en Onboarding y Continuación de Procesos Automatizados

**Fecha:** N/A
**Autor:** Equipo de Desarrollo - Core Bancario
**Prioridad:** Alta

## Resumen Ejecutivo

Se corrigió un bug en el flujo de onboarding que afectaba a los usuarios cuyo Identificador Nacional Electoral (INE) requería revisión manual (estado `INE_REVIEW`). Anteriormente, estos usuarios podían quedar bloqueados sin poder registrar su consentimiento para la consulta al buró de crédito, y el sistema no continuaba automáticamente con los pasos de consulta al buró y asignación de límite de crédito una vez que un administrador aprobaba la INE. La solución implementada asegura que el consentimiento del buró se registre correctamente, que el usuario reciba la información adecuada sobre el estado de revisión, y que el flujo de onboarding continúe de forma automatizada post-aprobación administrativa si se cumplen las condiciones.

## Problema Identificado

El proceso de onboarding presentaba las siguientes deficiencias cuando la verificación de la INE resultaba en un estado `INE_REVIEW`:

1.  **Registro de Consentimiento de Buró Incompleto:** Si un usuario llegaba al paso de dar consentimiento para la consulta al buró de crédito mientras su INE estaba pendiente de revisión manual, su decisión explícita (`consentToBureauCheck`) no se almacenaba de forma persistente si el flujo principal de cambio de estado se detenía debido a la revisión de la INE.
2.  **Interrupción del Flujo Post-Aprobación:** Una vez que un administrador aprobaba manualmente una INE (cambiando el estado a `INE_MANUALLY_APPROVED`), el sistema no contaba con la lógica para retomar automáticamente los siguientes pasos críticos del onboarding, como:
    *   Realizar la consulta al buró de crédito (si el usuario había consentido).
    *   Intentar la asignación del límite de crédito inicial.
3.  **Experiencia de Usuario:** Los usuarios en `INE_REVIEW` no recibían una comunicación clara en el paso final del envío de datos sobre el estado de su solicitud, generando incertidumbre.

Esto resultaba en un proceso manual adicional post-aprobación y una posible mala experiencia para el usuario.

## Solución Implementada

Se realizaron las siguientes modificaciones técnicas para abordar estos problemas:

### 1. Actualización del Esquema de Base de Datos (`profiles`)

Se añadió un nuevo campo a la tabla `profiles` en `packages/db/schema/profiles.ts` para registrar explícitamente la decisión del usuario sobre la consulta al buró:

```typescript
// En packages/db/schema/profiles.ts
export const profiles = pgTable('profiles', {
  // ... campos existentes ...
  bureauConsentGiven: boolean('bureau_consent_given').default(false),
  // ... campos existentes ...
});
```

-   **Justificación:** Permite almacenar de forma fiable la decisión del usuario sobre el consentimiento, independientemente del estado de revisión de la INE.

### 2. Modificación del Endpoint `POST /onboarding/complete`

El handler de este endpoint en `apps/api/src/routes/onboarding.ts` fue ajustado:

-   **Almacenamiento del Consentimiento:** El valor de `body.consentToBureauCheck` (la decisión del usuario sobre la consulta al buró) ahora siempre se guarda en el nuevo campo `profiles.bureauConsentGiven`, incluso si el `onboardingStatus` es `INE_REVIEW`.
    ```typescript
    // En apps/api/src/routes/onboarding.ts, dentro de POST /complete
    if (typeof body.consentToBureauCheck === 'boolean') {
      await db.update(profiles)
        .set({ 
            bureauConsentGiven: body.consentToBureauCheck,
            updatedAt: new Date() 
        })
        .where(eq(profiles.userId, userId));
    }
    ```
-   **Manejo del Caso `INE_REVIEW`:**
    *   Si `userProfile.onboardingStatus` es `INE_REVIEW`, el endpoint solo actualiza `bureauConsentGiven`.
    *   No se cambia el `onboardingStatus` principal del usuario.
    *   No se intenta la consulta al buró de crédito en este momento.
    *   Se devuelve una respuesta al usuario indicando que su INE está en revisión manual, utilizando un nuevo campo `statusInfo: 'INE_PENDING_MANUAL_REVIEW'` en la respuesta.
-   **Flujo Normal (No `INE_REVIEW`):**
    *   Si el perfil no está en `INE_REVIEW`, se actualiza `bureauConsentGiven` y se procede con la lógica original: se actualiza `onboardingStatus` (a `PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN` o `DENIED`) y se intenta la consulta al buró si el consentimiento fue otorgado.

-   **Justificación:** Asegura que la decisión del usuario sobre el buró siempre se capture. Proporciona una comunicación clara al usuario en revisión y detiene los procesos automatizados sensibles hasta la aprobación manual.

### 3. Modificación del Endpoint `POST /admin/users/:userId/ine-review` (Lógica de Aprobación)

La lógica dentro del handler en `apps/api/src/routes/admin/users.ts` para cuando `action === 'approve'` fue extendida:

-   **Verificación del Consentimiento Post-Aprobación:**
    *   Después de que el administrador aprueba la INE y el `onboardingStatus` se actualiza a `INE_MANUALLY_APPROVED` (y se registra en `profileFieldHistory`).
    *   El sistema recarga el perfil del usuario.
    *   Se verifica el valor del campo `approvedProfile.bureauConsentGiven`.
-   **Continuación Automatizada del Flujo:**
    *   **Si `bureauConsentGiven` es `true`** y los campos de perfil requeridos para la consulta al buró están completos:
        1.  **Consulta al Buró:** Se invoca `CreditBureauService.fetchAndSaveDummyCreditReport()`.
        2.  Si la consulta es exitosa, el `onboardingStatus` se actualiza a `DUMMY_BUREAU_CHECK_COMPLETED` (o el estado correspondiente que indique la finalización de la consulta) y se registra en `profileFieldHistory`.
        3.  **Asignación de Límite de Crédito:** Se invoca `InitialCreditService.assignInitialCreditLimit()`.
        4.  Si la asignación es exitosa, se podría actualizar el `onboardingStatus` a un estado final que indique que el usuario está activo y con crédito (ej., `LOAN_ELIGIBLE` - este estado debe ser definido y manejado según el flujo de la aplicación). Este cambio también se registra en `profileFieldHistory`.
        5.  El mensaje de respuesta al administrador se actualiza para reflejar las acciones realizadas.
    *   **Si `bureauConsentGiven` es `false`** o faltan datos en el perfil:
        *   El usuario permanece con el estado `INE_MANUALLY_APPROVED`.
        *   No se realizan las consultas ni asignaciones automáticas.
        *   Se registra un log y se informa en el mensaje de respuesta.
-   **Importaciones de Servicios:** Se aseguraron las importaciones de `CreditBureauService` e `InitialCreditService`.

-   **Justificación:** Automatiza los pasos restantes del onboarding una vez que la validación manual de la INE es exitosa, basándose en el consentimiento previamente registrado por el usuario, y mantiene un registro detallado de cada cambio de estado.

## Beneficios de la Solución

1.  **Experiencia de Usuario Mejorada:** Los usuarios pueden completar todos los pasos de envío de información del onboarding y reciben una comunicación clara si su INE requiere revisión manual.
2.  **Flujo de Onboarding Robusto:** El proceso continúa automáticamente después de la aprobación administrativa, reduciendo la necesidad de intervención manual para los pasos siguientes.
3.  **Registro Explícito del Consentimiento:** La decisión del usuario sobre la consulta al buró se almacena de forma fiable, independientemente del estado de revisión de la INE.
4.  **Mayor Trazabilidad:** Cada cambio de estado significativo se registra en `profileFieldHistory`, incluyendo las acciones automáticas post-aprobación.
5.  **Integridad del Proceso:** Las operaciones sensibles como la consulta al buró y la asignación de crédito solo se ejecutan después de la validación de identidad y con el consentimiento explícito del usuario.

## Pasos Adicionales / Recomendaciones

1.  **Migración de Base de Datos:** Es crucial generar y ejecutar una nueva migración de base de datos para añadir el campo `bureauConsentGiven` a la tabla `profiles`.
2.  **Definición del Estado Final:** Revisar y definir claramente en el enum `OnboardingStatus` y en la lógica de `POST /admin/users/:userId/ine-review` cuál es el estado final que un usuario debe alcanzar después de una asignación de crédito exitosa post-aprobación de INE.
3.  **Pruebas Exhaustivas:** Realizar pruebas completas de todos los escenarios de onboarding, incluyendo diferentes combinaciones de resultados de verificación de INE y decisiones de consentimiento de buró, para asegurar la correcta implementación del flujo.
4.  **Manejo de Errores:** Refinar el manejo de errores y los posibles estados intermedios si la consulta al buró o la asignación de crédito fallan después de una aprobación de INE. 