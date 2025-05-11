# Documentación Detallada del Servicio: Autenticación (Auth)

Este documento detalla cada uno de los endpoints gestionados por el servicio de Autenticación (`auth.ts`). Está diseñado para servir como referencia técnica exhaustiva tanto para el equipo de backend como para el equipo de frontend.

## Endpoints

### 1. Ruta de Prueba de Autenticación
- **Método**: `GET`
- **URL**: `/auth/test`
- **Descripción General**: Endpoint simple para verificar la disponibilidad y configuración básica del servicio de autenticación y la conexión con Supabase.
- **Autenticación**: No requerida.
- **Tags**: `Auth` (implícito, aunque no listado explícitamente en el schema del `auth.ts` para esta ruta específica).
- **Respuestas**:
    - `200 OK`: Servicio funcionando.
        - **Cuerpo**: `{"message": "Auth routes working!", "supabaseAvailable": boolean}`. `supabaseAvailable` indica si el cliente Supabase está accesible desde Fastify.

### 2. Registrar un Nuevo Usuario (Sign Up)
- **Método**: `POST`
- **URL**: `/auth/signup`
- **Descripción General**: Permite a un nuevo usuario registrarse en el sistema proporcionando su correo electrónico y contraseña. Tras un registro exitoso en Supabase, se crea automáticamente un perfil asociado al usuario mediante un trigger en la base de datos.
- **Autenticación**: No requerida.
- **Tags**: `Auth`
- **Cuerpo de la Solicitud (`application/json`)**: `AuthCredentialsSchema` (ver Schemas Comunes)
    - *Ejemplo*:
      ```json
      {
        "email": "nuevo.usuario@example.com",
        "password": "contraseñaSegura123"
      }
      ```
- **Respuestas**:
    - `201 Created`: Usuario registrado y perfil creado con éxito.
        - **Cuerpo**: `SignupSuccessReplySchema` (ver Schemas Comunes). Contiene el objeto de usuario y la sesión de Supabase.
    - `400 Bad Request`: Error de validación del cuerpo de la solicitud (ej. email inválido, contraseña corta) o error devuelto por Supabase durante el signup (ej. usuario ya existe con ese email).
        - **Cuerpo**: `ErrorReplySchema` (ver Schemas Comunes).
        - *Ejemplo de Mensaje de Error (Supabase)*: `"User already registered"` (el código de estado podría ser 400 o 422 dependiendo del error específico de Supabase).
    - `500 Internal Server Error`: Error inesperado en el servidor o al interactuar con Supabase.
        - **Cuerpo**: `ErrorReplySchema` (ver Schemas Comunes).
        - *Ejemplo*: `{"error": "Signup failed to return user data."}` o `{"error": "Internal Server Error during signup"}`.
- **Lógica Principal**:
    1.  Valida el cuerpo de la solicitud contra `AuthCredentialsSchema`.
    2.  Llama a `fastify.supabase.auth.signUp()` con el `email` y `password`.
    3.  Si Supabase devuelve un error (ej. usuario ya existe, error de validación de contraseña en Supabase), se formatea y devuelve una respuesta de error adecuada.
    4.  Si el registro es exitoso pero no se devuelve `data.user`, se considera un error interno.
    5.  **Nota Importante**: La creación del perfil del usuario en la tabla `profiles` se maneja automáticamente mediante un trigger en la base de datos de Supabase que se activa cuando se inserta un nuevo usuario en `auth.users`.
    6.  Responde con el objeto de usuario y sesión devuelto por Supabase.

### 3. Autenticar Usuario (Sign In)
- **Método**: `POST`
- **URL**: `/auth/signin`
- **Descripción General**: Permite a un usuario existente iniciar sesión proporcionando su correo electrónico y contraseña. Si las credenciales son válidas, devuelve el objeto de usuario y una nueva sesión (incluyendo el token JWT).
- **Autenticación**: No requerida.
- **Tags**: `Auth`
- **Cuerpo de la Solicitud (`application/json`)**: `AuthCredentialsSchema` (ver Schemas Comunes)
    - *Ejemplo*:
      ```json
      {
        "email": "usuario.existente@example.com",
        "password": "contraseña123"
      }
      ```
- **Respuestas**:
    - `200 OK`: Autenticación exitosa.
        - **Cuerpo**: `SessionReplySchema` (ver Schemas Comunes). Contiene el objeto de usuario y la sesión de Supabase.
    - `400 Bad Request` / `401 Unauthorized`: Credenciales inválidas (email o contraseña incorrectos). El código exacto puede depender de cómo Supabase reporta este error (generalmente 400 para "Invalid login credentials").
        - **Cuerpo**: `ErrorReplySchema` (ver Schemas Comunes). *Mensaje*: `"Invalid login credentials"`.
    - `500 Internal Server Error`: Error inesperado en el servidor o al interactuar con Supabase.
        - **Cuerpo**: `ErrorReplySchema` (ver Schemas Comunes).
- **Lógica Principal**:
    1.  Valida el cuerpo de la solicitud contra `AuthCredentialsSchema`.
    2.  Llama a `fastify.supabase.auth.signInWithPassword()` con el `email` y `password`.
    3.  Si Supabase devuelve un error (ej. credenciales incorrectas), se formatea y devuelve una respuesta de error.
    4.  Responde con el objeto de usuario y sesión devuelto por Supabase.

### 4. Obtener Detalles del Usuario Autenticado
- **Método**: `GET`
- **URL**: `/auth/user`
- **Descripción General**: Recupera los detalles del usuario actualmente autenticado, basado en el token JWT proporcionado en la cabecera `Authorization`.
- **Autenticación**: Requerida (Token Bearer). Utiliza el hook `authenticateRequest`.
- **Tags**: `Auth`
- **Seguridad**: `[{ "bearerAuth": [] }]`
- **Respuestas**:
    - `200 OK`: Detalles del usuario obtenidos con éxito.
        - **Cuerpo**: `UserReplySchema` (ver Schemas Comunes). Contiene el objeto de usuario de Supabase.
    - `401 Unauthorized`: Token no proporcionado, inválido o expirado.
        - **Cuerpo**: `ErrorReplySchema` (ver Schemas Comunes). *Mensaje*: `"Unauthorized: Missing token"` o `"Unauthorized: Invalid token"`.
    - `500 Internal Server Error`: Error inesperado.
        - **Cuerpo**: `ErrorReplySchema`. *Mensaje*: `"Internal Server Error: User context missing after auth hook."` (si el hook de autenticación falla pero la ruta es alcanzada).
- **Lógica Principal (El hook `authenticateRequest` se ejecuta antes)**:
    1.  **Hook `authenticateRequest`**:
        a.  Extrae el token JWT de la cabecera `Authorization: Bearer <token>`.
        b.  Si no hay token, responde con error 401.
        c.  Llama a `request.server.supabase.auth.getUser(token)` para validar el token y obtener el usuario.
        d.  Si hay un error o no se obtiene usuario, responde con error 401.
        e.  Si es exitoso, adjunta el objeto `data.user` a `request.user`.
    2.  **Handler de la Ruta**:
        a.  Verifica si `request.user` existe (como una capa extra de seguridad).
        b.  Responde con el objeto `request.user` (que es el usuario de Supabase).

### 5. Cerrar Sesión del Usuario (Sign Out)
- **Método**: `POST`
- **URL**: `/auth/signout`
- **Descripción General**: Cierra la sesión del usuario actualmente autenticado, invalidando el token de sesión actual en el lado del servidor (Supabase).
- **Autenticación**: Requerida (Token Bearer). Utiliza el hook `authenticateRequest`.
- **Tags**: `Auth`
- **Seguridad**: `[{ "bearerAuth": [] }]`
- **Respuestas**:
    - `200 OK`: Sesión cerrada con éxito.
        - **Cuerpo**: `SignoutSuccessReplySchema` (ver Schemas Comunes). *Mensaje*: `{"message": "Signed out successfully"}`.
    - `401 Unauthorized`: Token no proporcionado, inválido o expirado (manejado por el hook).
        - **Cuerpo**: `ErrorReplySchema` (ver Schemas Comunes).
    - `500 Internal Server Error`: Error al intentar cerrar la sesión en Supabase.
        - **Cuerpo**: `ErrorReplySchema` (ver Schemas Comunes). *Mensaje*: (Mensaje de error de Supabase).
- **Lógica Principal (El hook `authenticateRequest` se ejecuta antes)**:
    1.  **Hook `authenticateRequest`**: (Misma lógica que para `GET /auth/user`).
    2.  **Handler de la Ruta**:
        a.  Llama a `fastify.supabase.auth.signOut()`.
        b.  Si Supabase devuelve un error, se formatea y responde.
        c.  Responde con un mensaje de éxito.

## Schemas Comunes

### `AuthCredentialsSchema`
Define la estructura para las credenciales de autenticación (email y password).
- `email` (string, obligatorio): Dirección de correo electrónico del usuario.
    - *Validación*: Debe tener formato de email. `format: 'email'`.
    - *Descripción*: User email address.
- `password` (string, obligatorio): Contraseña del usuario.
    - *Validación*: Longitud mínima de 8 caracteres. `minLength: 8`.
    - *Descripción*: User password (min 8 characters).

### `SignupSuccessReplySchema`
Define la estructura de la respuesta exitosa para el endpoint de registro (`/auth/signup`).
- `user` (object, obligatorio): Objeto de usuario devuelto por Supabase.
    - *Descripción*: Supabase User object (se usa `Type.Any()` debido a su complejidad y origen externo).
- `session` (object, obligatorio): Objeto de sesión devuelto por Supabase.
    - *Descripción*: Supabase Session object (se usa `Type.Any()`).

### `SessionReplySchema`
Define la estructura de la respuesta exitosa para el endpoint de inicio de sesión (`/auth/signin`).
- `user` (object, obligatorio): Objeto de usuario devuelto por Supabase.
    - *Descripción*: Supabase User object.
- `session` (object, obligatorio): Objeto de sesión devuelto por Supabase (incluye el token JWT).
    - *Descripción*: Supabase Session object.

### `UserReplySchema`
Define la estructura de la respuesta exitosa para el endpoint de obtener usuario (`/auth/user`).
- `user` (object, obligatorio): Objeto de usuario devuelto por Supabase.
    - *Descripción*: Supabase User object.

### `SignoutSuccessReplySchema`
Define la estructura de la respuesta exitosa para el endpoint de cierre de sesión (`/auth/signout`).
- `message` (string, obligatorio): Mensaje indicando el éxito de la operación.

### `ErrorReplySchema`
Schema genérico para respuestas de error en el servicio de autenticación.
- `error` (string, obligatorio): Un mensaje de error principal.
- `details` (any, opcional): Detalles adicionales sobre el error (raramente usado en estos endpoints, pero disponible).

--- 