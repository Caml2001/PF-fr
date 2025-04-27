# Documentación del Onboarding Flow (Actualizado)

## Resumen del flujo actual

El proceso de onboarding está dividido en pasos secuenciales para capturar y validar los datos necesarios para el registro de un usuario. El flujo y los campos implementados actualmente son:

---

### 1. Primer paso: Datos de acceso
- **Número de teléfono**
- **Correo electrónico**
- **Contraseña**

### 2. Segundo paso: Verificación
- **OTP** (código enviado por SMS)

### 3. Tercer paso: Datos personales
- **Primer Nombre**
- **Segundo Nombre**
- **Apellido Paterno**
- **Apellido Materno**
- **Fecha de nacimiento**
- **Sexo** (Hombre/Mujer)

> **Nota:** Estos datos se envían al endpoint `/onboarding/temp` para almacenamiento temporal, usando autenticación JWT.

### 4. Cuarto paso: Documentos oficiales
- **INE frontal** (foto)
- **INE trasera** (foto)

### 5. Quinto paso: Confirmar y completar perfil
- **CURP**
- **Calle**
- **Número**
- **Colonia**
- **Municipio**
- **Estado**
- **Código Postal**

---

## Eventos y llamadas clave en el flujo

| Paso                | Evento/Llamada                                    | Momento de ejecución                                  |
|---------------------|---------------------------------------------------|-------------------------------------------------------|
| 1. Datos de acceso  | POST `/register`                                  | Al dar siguiente tras capturar mail, teléfono y pass  |
| 2. Verificación OTP | POST `/phone`                                     | Al dar siguiente tras ingresar el teléfono            |
| 2. Verificación OTP | POST `/otp`                                       | Al ingresar el código OTP y dar siguiente             |
| 3. Datos personales | POST `/onboarding/temp`                           | Al dar siguiente tras capturar nombre, fecha, sexo    |
| 4. Documentos INE   | POST `/onboarding/ine`                            | Tras subir ambas imágenes de INE                      |
| 5. Confirmar perfil | POST `/onboarding/profile`                        | Al finalizar y confirmar todos los datos              |

> **Notas:**
> - En cada POST relevante se incluye el JWT en el header Authorization.
> - Si ocurre un error, se muestra feedback inmediato al usuario.
> - Tras subir INE, se muestra un overlay de procesamiento.

## Estados de Onboarding (`onboardingStatus`)

A continuación se muestra el valor esperado de `onboardingStatus` en cada paso del flujo:

| Paso                       | onboardingStatus         | Descripción                                      |
|----------------------------|-------------------------|--------------------------------------------------|
| 1. Datos de acceso         | `account_created`       | Usuario registrado, falta verificar teléfono     |
| 2. Verificación OTP        | `phone_verified`        | Teléfono verificado, falta datos personales      |
| 3. Datos personales        | `personal_data`         | Datos personales enviados, falta INE             |
| 4. Documentos INE          | `ine_uploaded`          | INE subida, falta completar perfil               |
| 5. Confirmar y completar   | `profile_completed`     | Perfil completo, onboarding terminado            |

> **Notas:**
> - El backend puede devolver estos valores en la respuesta de cada endpoint, permitiendo reanudar el flujo donde se quedó el usuario.
> - Si ocurre un error o el usuario abandona, el frontend debe consultar el status para continuar correctamente.

## Detalles técnicos relevantes
- El frontend utiliza un `apiClient` de axios con `baseURL` configurado y manejo automático del token JWT.
- El endpoint `/onboarding/temp` recibe los datos personales y requiere autenticación.
- Se muestra un overlay de "procesando" tras subir el INE para mejorar la experiencia del usuario.
- Todas las validaciones de campos están implementadas en el frontend antes de avanzar de paso.

## Pendientes y próximos pasos
- Recabar feedback de usuarios sobre la experiencia.
- Documentar respuestas esperadas de la API y posibles errores.
- Verificar responsividad y experiencia en dispositivos móviles.

---

*Última actualización: 26/abril/2025*
