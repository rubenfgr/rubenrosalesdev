---
kind: model
---

# rubenrosales.dev — Design system (fundamentos)

Identidad visual base: logo, color, tipografía, espaciado, movimiento, iconografía, motivos y voz. No incluye componentes ni páginas.

### web.ds-estructura — Estructura de ficheros del sistema de diseño

Dónde viven los tokens, el logo, los motivos y los documentos del sistema de diseño; `tokens.css` es la fuente de verdad.


```
src/styles/tokens.css      ← fuente de verdad de los tokens
src/assets/logo/           ← logo, símbolo y favicon (SVG)
src/assets/motifs/         ← motivo «hilada»
docs/web/brand-guidelines.md   ← concepto, decisiones, uso del logo, color, tipografía, voz
docs/web/design-system.md      ← este archivo
```

### web.ds-uso-tokens — Uso de los tokens

Los componentes cargan `tokens.css` y usan solo tokens semánticos; la web es solo clara (`data-theme="light"`), sin modo oscuro.


1. Carga la fuente y los tokens. En la web, **Archivo y JetBrains Mono van autoalojadas** (variables; Archivo con ejes `wght` y `wdth`, JetBrains Mono con `wght`), sin peticiones a Google Fonts. Para prototipos rápidos sirve el enlace de Google Fonts.

```css
@import "./tokens.css";
```

2. Usa **solo tokens semánticos** en componentes:

```css
body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body);
  line-height: var(--line-height-relaxed);
}
h1 {
  font-size: var(--font-size-display);
  font-stretch: var(--font-width-display);
  font-weight: var(--font-weight-strong);
  letter-spacing: var(--letter-spacing-display);
  line-height: var(--line-height-tight);
}
:focus-visible {
  outline: var(--focus-ring-width) solid var(--color-focus);
  outline-offset: var(--focus-ring-offset);
}
```

3. Tema: la web es solo clara (`data-theme="light"` fijo en `Layout.astro`). No hay modo oscuro: `tokens.css` solo define el tema claro, y las secciones oscuras son paneles de color.

### web.ds-escala-tipografica — Escala tipográfica fluida

Los tamaños son tokens `clamp()` de 360 a 1440 px; el cuerpo nunca baja de 16 px y la línea no pasa de 66 caracteres.


Los tamaños viven en `tokens.css` como `clamp()` (rango de 360 a 1440 px) y los componentes **no fijan `font-size` en px**: usan estos tokens.

| Token | Rango | Uso |
|---|---|---|
| `--font-size-hero` | 36 → 84 px | h1 de la home |
| `--font-size-section` | 32 → 72 px | título de sección de la home |
| `--font-size-display` | 36 → 68 px | h1 de páginas interiores |
| `--font-size-h2` / `-h3` / `-h4` | 28→44 / 22→28 / 19→22 px | titulares de contenido |
| `--font-size-figure` | 48 → 88 px | cifras grandes (pasos, calculadora) |
| `--font-size-lead` | 18 → 20 px | entradillas |
| `--font-size-body` | 16 px | texto corrido (nunca menos en móvil) |
| `--font-size-label` / `-small` / `-caption` / `-mono` | 14 / 13 / 12,8 / 12 px | texto secundario, metadatos, notas, cifras mono |

Reglas: cuerpo ≥ 16 px; longitud de línea ≤ 70 caracteres (`--measure`, 66ch); titulares con tope en pantallas grandes. Excepción: las maquetas decorativas de «Servicios» (factura y móvil de ejemplo) llevan tamaños propios porque reproducen un objeto a escala.

### web.ds-objetivos-tactiles — Objetivos táctiles

`--target-min` (44 px) es el mínimo de botones, enlaces de listas y controles; los enlaces dentro de un párrafo quedan exentos.


`--target-min` (44 px) es el tamaño mínimo de botones, enlaces de listas y controles. Enlaces dentro de un párrafo quedan exentos. Cuando el elemento visual es más pequeño (por ejemplo, los puntos del carrusel de proyectos), la zona pulsable se amplía con padding o `::before`.

### web.ds-validacion-formularios — Validación de formularios

Los límites de cada campo viven en `contactLimits` y los comparten la API y la web; se avisa al salir del campo y no se recorta lo escrito.


Los límites de cada campo viven en `contactLimits` (`packages/shared/src/index.ts`) y los usan tanto el esquema Zod de la API como la web (`maxlength`, avisos). No se duplican números en los componentes.

- Todos los campos llevan `required` o `maxlength` según corresponda, `aria-invalid` y `aria-describedby` apuntando al aviso, y el tipo y `inputmode` adecuados (email, tel).
- Se avisa al salir del campo (`blur`) y mientras hay aviso se quita en cuanto el valor es válido. Al avanzar de paso o enviar se validan todos los campos del paso.
- Los textos largos no se recortan: lo que se escribe es lo que se envía, y la vista previa lo muestra entero con scroll.

### web.ds-accesibilidad-medida — Accesibilidad medida

Resultados de Lighthouse 13.5.0 sobre el build de producción, con los fallos de contraste que quedan a propósito en las demos.


Lighthouse 13.5.0 sobre el build de producción (`pnpm dlx lighthouse`, Chrome headless): home en móvil 93 de rendimiento, 95–97 de accesibilidad, 100 de buenas prácticas y 100 de SEO, CLS 0 y TBT 0 ms; el blog 98 / 100 / 100 / 100. Los fallos de contraste que quedan son los estados «aún no llegado» de las demos (filas de la maqueta de Proyectos y la tarjeta de espera de Integraciones), que se atenúan a propósito.

### web.ds-anadir-token — Añadir un token

Antes de crear un token se comprueba si otro cubre el rol; el nombre describe el rol, el color se define en el tema claro y su contraste se calcula.


1. **¿Hace falta?** Antes de crear uno nuevo, comprueba si un token existente cubre el rol.
2. **Primitivo** (`--rr-<familia>-<paso>`): solo si se necesita un valor que no existe. Nunca se usa directamente en componentes.
3. **Semántico** (`--color-<rol>`, `--space-*`…): el nombre describe el rol, nunca el color (`--color-primary`, no `--color-blue`).
4. Si es de color, defínelo en el bloque del tema claro (no hay otro).
5. Si es un par texto/fondo, calcula su contraste y añádelo a la tabla de contraste de [[web.color-contraste]]. No documentes ratios sin calcularlos.

### web.ds-pendiente — Pendiente del sistema de diseño

Queda por mapear `--color-code-*` al resaltador de código del blog y por generar `tokens.json` (DTCG) solo si se usan tokens en Figma o Penpot.


- Mapear `--color-code-*` al tema del resaltador de código del blog.

- `tokens.json` (formato W3C DTCG) no se incluye en esta versión. Generarlo solo cuando se vayan a usar tokens en Figma o Penpot.
