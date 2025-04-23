# PrestaFirme Frontend

Este repositorio contiene el frontend del MVP para PrestaFirme, una aplicación digital de microcréditos.

## Descripción General

La aplicación permite a los usuarios:
- Registrarse e iniciar sesión (autenticación por email o teléfono).
- Completar un onboarding con datos personales y documentos.
- Otorgar consentimiento para consulta en buró de crédito.
- Solicitar un crédito, seleccionando monto y plazo.
- Consultar el estado de su solicitud y el cronograma de pagos.
- Realizar pagos de su crédito y consultar historial de pagos.

## Tecnologías principales
- **React** (Vite) + TypeScript
- **TailwindCSS** para estilos
- **Radix UI** y componentes personalizados
- Arquitectura modular por flujos de negocio

## Estructura principal

- `/client/src/components` — Componentes React principales (formularios, onboarding, pagos, etc.)
- `/documentation/frontend-requirements` — Documentación de requerimientos del frontend por flujo
- `/documentation/backend-requests` — (Referencia) Documentación de endpoints backend sugeridos
- `/server` — (Opcional) Mock API o backend de pruebas

## Scripts útiles

- `npm install` — Instala dependencias
- `npm run dev` — Inicia el servidor de desarrollo
- `npm run build` — Compila para producción

## Notas
- El frontend está preparado para consumir endpoints RESTful documentados en `/documentation/backend-requests`.
- El diseño y los flujos están pensados para dispositivos móviles, pero son responsivos.
- Para pruebas locales, se puede usar un backend mock o conectar con el backend real conforme se implemente.

## Contacto
Para dudas o colaboración, contactar a los responsables del proyecto.
