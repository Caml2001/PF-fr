# Flujo de Trabajo Base de Datos: Desarrollo vs. Producción (Drizzle ORM)

Este documento describe el flujo de trabajo recomendado para gestionar cambios en el esquema de la base de datos utilizando Drizzle ORM en los entornos de desarrollo y producción.

## Configuración Actual

*   **Entornos:**
    *   **Desarrollo (Dev):** Configurado para ejecutarse localmente.
    *   **Producción (Prod):** Desplegado en un servidor/plataforma.
*   **Archivos de Entorno:**
    *   [.env](cci:7://file:///Users/carlosmartinezlopez/Desktop/prestaFirme/backend/.env:0:0-0:0): (Raíz del proyecto) Contiene la `DATABASE_URL` para el **entorno de desarrollo**. Actualmente usa la URL del **Session Pooler** de Supabase para desarrollo (compatible con IPv4).
    *   `.env.dev`: Usado por la aplicación cuando `NODE_ENV=development`. **NO** es usado directamente por los comandos de Drizzle Kit en la configuración actual.
    *   `.env.prod`: Contiene la `DATABASE_URL` para el **entorno de producción**. Actualmente usa la URL del **Session Pooler** de Supabase para producción (compatible con IPv4). **NO** es usado directamente por los comandos de Drizzle Kit en la configuración actual, se debe pasar explícitamente.
*   **Archivos de Drizzle:**
    *   `packages/db/drizzle.config.ts`: Archivo de configuración principal para Drizzle Kit. **Importante:** En la configuración actual, este archivo está configurado para leer **SIEMPRE** la `DATABASE_URL` del archivo [.env](cci:7://file:///Users/carlosmartinezlopez/Desktop/prestaFirme/backend/.env:0:0-0:0) de la raíz, por lo que los comandos por defecto operan sobre la base de datos de desarrollo.
    *   `packages/db/drizzle/schema.ts`: Define la estructura de tus tablas usando la sintaxis de Drizzle. *(Resultado del `introspect`)*
    *   `packages/db/drizzle/relations.ts`: Define las relaciones entre tus tablas. *(Resultado del `introspect`)*
    *   `packages/db/drizzle/*.sql`: Archivos de migración SQL generados por Drizzle Kit. Cada archivo representa un conjunto de cambios en el esquema. **Deben ser versionados en Git.**
*   **Scripts (package.json):**
    *   `pnpm db:generate`: Ejecuta `npx drizzle-kit generate ...`. Genera un nuevo archivo `.sql` basado en los cambios detectados entre tus archivos de esquema (`schema.ts`, `relations.ts`) y el estado registrado de las migraciones.
    *   `pnpm db:migrate:dev`: Ejecuta `npx drizzle-kit migrate ...`. Aplica las migraciones `.sql` pendientes a la base de datos configurada en `drizzle.config.ts` (que apunta al [.env](cci:7://file:///Users/carlosmartinezlopez/Desktop/prestaFirme/backend/.env:0:0-0:0) de la raíz, es decir, a **desarrollo**).

## Flujo de Trabajo Detallado

**Fase 1: Desarrollo Local**

1.  **Modificar Esquema:**
    *   Si necesitas cambiar la estructura de la base de datos (añadir/modificar tablas, columnas, etc.), edita los archivos:
        *   `packages/db/drizzle/schema.ts`
        *   `packages/db/drizzle/relations.ts`
2.  **Generar Migración SQL:**
    *   Abre tu terminal en la raíz del proyecto (`/Users/carlosmartinezlopez/Desktop/prestaFirme/backend`).
    *   Ejecuta el comando:
        ```bash
        pnpm db:generate
        ```
    *   Drizzle Kit comparará tus archivos de esquema con el historial de migraciones y generará un nuevo archivo `.sql` en `packages/db/drizzle/` (ej: `0001_nombre_descriptivo.sql`).
    *   **Recomendado:** Revisa el contenido de este archivo `.sql` para asegurarte de que los cambios SQL son los que esperabas.
3.  **Aplicar Migración (a Desarrollo):**
    *   Asegúrate de que tu base de datos de desarrollo esté accesible.
    *   Ejecuta el comando:
        ```bash
        pnpm db:migrate:dev
        ```
    *   Drizzle Kit se conectará a la base de datos de **desarrollo** (usando la URL del archivo `.env` de la raíz) y aplicará cualquier archivo `.sql` de migración que aún no se haya ejecutado en esa base de datos.
4.  **Probar:**
    *   Ejecuta tu aplicación localmente (`pnpm dev` o similar) y prueba exhaustivamente que todo funcione correctamente con el nuevo esquema de la base de datos de desarrollo.

**Fase 2: Subir Cambios a Git**

1.  **Añadir Cambios:**
    *   Añade al stage de Git **todos** los archivos modificados y los nuevos:
        *   Los archivos de esquema (`schema.ts`, `relations.ts`) si los modificaste.
        *   El **nuevo archivo de migración `.sql`** generado (ej: `packages/db/drizzle/0001_nombre_descriptivo.sql`).
        *   Cualquier otro archivo de código que hayas modificado.
    *   Comando: `git add .` (o añade los archivos específicos).
2.  **Commit:**
    *   Crea un commit descriptivo:
        ```bash
        git commit -m "feat(db): Añadir campo X a tabla Y y actualizar lógica relacionada"
        ```
3.  **Push:**
    *   Sube tus cambios al repositorio remoto (ej: GitHub):
        ```bash
        git push origin main # O tu rama de trabajo
        ```

**Fase 3: Despliegue a Producción**

1.  **Desplegar Código:**
    *   Actualiza el código en tu servidor/plataforma de producción con la última versión que acabas de subir a Git. Este proceso depende de tu sistema de despliegue (CI/CD, manual, etc.). Asegúrate de que los nuevos archivos `.sql` de migración estén presentes en el servidor de producción junto con el código.
2.  **Aplicar Migración (a Producción):**
    *   **Importante:** Este paso se realiza *después* de que el nuevo código esté desplegado.
    *   Necesitas ejecutar el comando `migrate` apuntando explícitamente a la base de datos de producción.
    *   **Método Recomendado (Explícito y Seguro):**
        *   Obtén la `DATABASE_URL` del **Session Pooler de Producción** (la que está en tu archivo `.env.prod`).
        *   Ejecuta el siguiente comando en el entorno de producción (o como parte del pipeline post-despliegue):
        ```bash
        DATABASE_URL="postgresql://postgres.lfgeihkmxemzyywxbkkr:ZPacSFu1C04F4u57@aws-0-us-east-1.pooler.supabase.com:5432/postgres" npx drizzle-kit migrate --config packages/db/drizzle.config.ts
        ```
        *(Asegúrate de que la URL y la contraseña sean correctas y estén protegidas)*.
    *   Drizzle Kit se conectará a la base de datos de **producción** y aplicará las migraciones `.sql` pendientes que encontró en la carpeta `packages/db/drizzle/` desplegada.

## Gestión de Objetos SQL Manuales (Triggers, Funciones, etc.)

**Importante:** Drizzle Kit, en este flujo, solo gestiona automáticamente los cambios en el esquema de **tablas** definidos en `schema.ts` y `relations.ts`.

Los objetos SQL más complejos como **Triggers**, **Funciones de Base de Datos**, o **Políticas de Seguridad a Nivel de Fila (RLS)** **NO** son gestionados por los comandos `db:generate` ni `db:migrate:dev`.

Estos objetos deben gestionarse manualmente siguiendo estos pasos:

1.  **Almacenamiento:**
    *   Todos los scripts SQL para crear o modificar estos objetos deben guardarse en archivos `.sql` individuales dentro de la carpeta:
        ```
        packages/db/manual_sql/
        ```
    *   Se recomienda usar un prefijo numérico (ej: `001_nombre.sql`, `002_otro_nombre.sql`) para indicar dependencias o un orden lógico si es necesario.
    *   **Estos archivos `.sql` DEBEN ser versionados en Git.**

2.  **Flujo de Desarrollo:**
    *   Cuando creas o modificas un archivo `.sql` en `packages/db/manual_sql/` (estando en una rama de funcionalidad, por ejemplo):
        *   Aplica **manualmente** el contenido de ese script a tu base de datos de **desarrollo** (usando el Editor SQL de Supabase, un cliente SQL como DBeaver/pgAdmin, etc.).
        *   Prueba la funcionalidad en desarrollo.
        *   Una vez validado, haz `git commit` del archivo `.sql` en tu rama.

3.  **Flujo de Despliegue a Producción:**
    *   Antes de desplegar una nueva versión a producción (después de hacer merge de tu rama a `main`):
        *   Identifica el último `tag` de Git que corresponde al estado actual de producción.
        *   Compara los cambios en la carpeta `manual_sql/` entre ese tag y `HEAD` (el commit que vas a desplegar):
            ```bash
            git diff <ultimo_tag_prod> HEAD -- packages/db/manual_sql/
            ```
        *   Esto te mostrará qué archivos `.sql` son **nuevos o han sido modificados** desde el último despliegue a producción.
    *   Durante el despliegue a producción (después de desplegar el código y ejecutar la migración de Drizzle si la hubo):
        *   Aplica **manualmente** (usando el Editor SQL de Supabase o cliente SQL) **únicamente** los scripts `.sql` identificados como nuevos o modificados en el paso anterior, asegurándote de mantener el orden correcto si hay dependencias.

**Este proceso manual es crucial.** Omitir la aplicación de estos scripts en cualquier entorno causará inconsistencias y posibles errores.

## Puntos Clave y Recordatorios

*   **NUNCA uses `push` en producción.** Usa siempre `generate` y `migrate` para tener un historial y control.
*   **SIEMPRE commitea los archivos `.sql`** generados junto con tus cambios de esquema. Son parte esencial del historial.
*   **Orden de Despliegue a Prod:** 1º Código, 2º Migración de Base de Datos.
*   **Poolers:** Usa los Session Poolers (`aws-0...`) tanto para desarrollo como para producción para asegurar la compatibilidad con IPv4 si es necesario.
*   **Seguridad:** Protege tus credenciales de producción (`DATABASE_URL` en `.env.prod` y al ejecutar el comando `migrate` en producción). No las commitees a Git.

Siguiendo este flujo, mantendrás tus entornos sincronizados de forma segura y controlada.