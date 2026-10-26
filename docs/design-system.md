# rubenrosales.dev — Design system (fundamentos)

Identidad visual base: logo, color, tipografía, espaciado, movimiento, iconografía, motivos y voz. No incluye componentes ni páginas.

## Estructura

```
src/styles/tokens.css      ← fuente de verdad de los tokens
src/assets/logo/           ← logo, símbolo y favicon (SVG)
src/assets/motifs/         ← motivo «hilada»
docs/brand-guidelines.md   ← concepto, decisiones, uso del logo, color, tipografía, voz
docs/design-system.md      ← este archivo
```

## Uso de los tokens

1. Carga la fuente y los tokens. En la web, **Archivo va autoalojada** (archivo variable con ejes `wght` y `wdth`), sin peticiones a Google Fonts. Para prototipos rápidos sirve el enlace de Google Fonts.

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

3. Tema: la web es siempre clara (`data-theme="light"` fijo en `Layout.astro`). Los bloques oscuros de `tokens.css` no se usan.

## Escala tipográfica fluida

Los tamaños viven en `tokens.css` como `clamp()` (rango de 360 a 1440 px) y los componentes **no fijan `font-size` en px**: usan estos tokens.

| Token | Rango | Uso |
|---|---|---|
| `--font-size-hero` | 36 → 84 px | h1 de la home |
| `--font-size-section` | 30 → 56 px | título de sección de la home |
| `--font-size-display` | 32 → 52 px | h1 de páginas interiores |
| `--font-size-h2` / `-h3` / `-h4` | 26→36 / 22→28 / 19→22 px | titulares de contenido |
| `--font-size-figure` | 40 → 56 px | cifras grandes (pasos, calculadora) |
| `--font-size-lead` | 18 → 20 px | entradillas |
| `--font-size-body` | 16 px | texto corrido (nunca menos en móvil) |
| `--font-size-label` / `-small` / `-caption` / `-mono` | 14 / 13 / 12,8 / 11 px | texto secundario, metadatos, notas, etiquetas mono |

Reglas: cuerpo ≥ 16 px; longitud de línea ≤ 70 caracteres (`--measure`, 66ch); titulares con tope en pantallas grandes. Excepción: las maquetas decorativas de «Servicios» (factura y móvil de ejemplo) llevan tamaños propios porque reproducen un objeto a escala.

## Objetivos táctiles

`--target-min` (44 px) es el tamaño mínimo de botones, enlaces de listas y controles. Enlaces dentro de un párrafo quedan exentos. Cuando el elemento visual es más pequeño (por ejemplo, los puntos del carrusel de proyectos), la zona pulsable se amplía con padding o `::before`.

## Añadir un token

1. **¿Hace falta?** Antes de crear uno nuevo, comprueba si un token existente cubre el rol.
2. **Primitivo** (`--rr-<familia>-<paso>`): solo si se necesita un valor que no existe. Nunca se usa directamente en componentes.
3. **Semántico** (`--color-<rol>`, `--space-*`…): el nombre describe el rol, nunca el color (`--color-primary`, no `--color-blue`).
4. Si es de color, defínelo en los **tres bloques**: tema claro, `[data-theme="dark"]` y la media query `prefers-color-scheme: dark`.
5. Si es un par texto/fondo, calcula su contraste y añádelo a la tabla de `brand-guidelines.md`. No documentes ratios sin calcularlos.

## Pendiente

- Mapear `--color-code-*` al tema del resaltador de código del blog.

- `tokens.json` (formato W3C DTCG) no se incluye en esta versión. Generarlo solo cuando se vayan a usar tokens en Figma o Penpot.
