# Documentación de Integración y Uso de Silk UI Components

## ¿Qué es Silk?
Silk es una librería de componentes UI moderna, accesible y con animaciones nativas. Permite crear modales, sheets, menús y otros elementos visuales de alta calidad con una experiencia móvil y web fluida.

---

## Instalación

1. **Instala el paquete:**
   ```bash
   npm install @silk-hq/components
   ```

2. **Importa los estilos base:**
   Es **obligatorio** importar los estilos de Silk para que los componentes funcionen correctamente.
   
   - En tu archivo principal (ejemplo: `src/main.tsx`):
     ```ts
     import "@silk-hq/components/unlayered-styles";
     import "./index.css";
     ```
   - O en tu CSS global:
     ```css
     @import "@silk-hq/components/unlayered-styles";
     ```

---

## Uso Básico: Bottom Sheet

```tsx
import { Sheet } from "@silk-hq/components";

<Sheet.Root license="commercial">
  <Sheet.Trigger asChild>
    <button>Menú</button>
  </Sheet.Trigger>
  <Sheet.Portal>
    <Sheet.View nativeEdgeSwipePrevention={true}>
      <Sheet.Backdrop themeColorDimming="auto" />
      <Sheet.Content className="rounded-t-3xl shadow-2xl p-0 overflow-hidden bg-white">
        <Sheet.BleedingBackground className="rounded-t-3xl bg-white" />
        {/* Tu contenido aquí */}
      </Sheet.Content>
    </Sheet.View>
  </Sheet.Portal>
</Sheet.Root>
```

- **`Sheet.Trigger`**: El botón que abre el modal.
- **`Sheet.Backdrop`**: El fondo oscuro que aparece detrás.
- **`Sheet.Content`**: El contenido del modal. Puedes personalizarlo con clases de Tailwind.
- **`Sheet.BleedingBackground`**: Fondo "flotante" para dar efecto de hoja.

---

## Consideraciones Importantes

### 1. Meta Tag de theme-color
Si usas `themeColorDimming` en el backdrop, **el meta tag de theme-color debe estar en formato rgb**:
```html
<meta name="theme-color" content="rgb(248, 249, 251)" />
```
No uses hex ni nombres de color.

### 2. No modifiques el layout del Sheet
No cambies height, position ni overflow del Sheet manualmente. Deja que Silk lo maneje.

### 3. No olvides el prop `license="commercial"`
Silk requiere este prop para funcionar en proyectos comerciales.

### 4. Tailwind y Silk
Puedes usar Tailwind para personalizar los componentes, pero evita sobrescribir clases críticas de Silk.

---

## Ejemplo de Menú Bonito

```tsx
<Sheet.Content className="rounded-t-3xl shadow-2xl p-0 overflow-hidden bg-white">
  <Sheet.BleedingBackground className="rounded-t-3xl bg-white" />
  <div className="flex flex-col gap-2 py-6 px-4">
    <div className="mb-2 text-center">
      <span className="block text-lg font-semibold text-primary">Menú de navegación</span>
      <span className="block text-xs text-muted-foreground">Selecciona una sección</span>
    </div>
    <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors text-left text-base font-medium">
      <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
        <svg className="h-5 w-5 text-primary" ... />
      </span>
      Inicio
    </button>
    {/* ...más botones... */}
  </div>
</Sheet.Content>
```

---

## Troubleshooting

- **Error `theme-color must use an rgb()`**:
  Cambia el meta tag a formato rgb.
- **Animaciones raras o errores de NaN:**
  Asegúrate de importar los estilos de Silk ANTES que cualquier otro CSS.
- **Props open/onOpenChange no funcionan:**
  Silk controla el estado de apertura internamente, usa `Sheet.Trigger` para abrir/cerrar.
- **El modal no se ve bien:**
  No modifiques el layout base, revisa que no haya conflictos de CSS globales.

---

## Recursos
- [Sitio oficial Silk](https://silkhq.co)
- [Ejemplos en el repo](../basic-examples-css-silk/src/app/page.tsx)

---

## Resumen
1. Instala Silk y sus estilos.
2. Usa los componentes como en los ejemplos.
3. Cuida el meta tag de theme-color.
4. Personaliza con Tailwind, pero no sobrescribas el layout base.

¡Listo! Ya puedes usar Silk en tu proyecto sin miedo :)
