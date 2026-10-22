# rubenrosales.dev — Design system (fundamentos)

Identidad visual base: logo, color, tipografía, espaciado, movimiento, iconografía, motivos y voz. No incluye componentes ni páginas.

## Estructura

```
design-system/
├── README.md              ← este archivo
├── brand-guidelines.md    ← concepto, decisiones, uso del logo, color, tipografía, voz
├── tokens/
│   └── tokens.css         ← fuente de verdad
├── logo/
│   ├── logo-horizontal.svg
│   ├── logo-horizontal-inverse.svg
│   ├── logo-horizontal-mono.svg
│   ├── symbol.svg
│   ├── symbol-inverse.svg
│   ├── symbol-mono.svg
│   └── favicon.svg
└── motifs/
    └── hilada.svg
```

## Uso de los tokens

1. Carga la fuente y los tokens. En la web, **Archivo va autoalojada** (archivo variable con ejes `wght` y `wdth`), sin peticiones a Google Fonts. Para prototipos rápidos sirve el enlace de Google Fonts.

```html
<link rel="stylesheet" href="tokens/tokens.css">
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

3. Tema: sin atributo, sigue la preferencia del sistema. Para forzarlo, `data-theme="light"` o `data-theme="dark"` en `<html>`.

## Añadir un token

1. **¿Hace falta?** Antes de crear uno nuevo, comprueba si un token existente cubre el rol.
2. **Primitivo** (`--rr-<familia>-<paso>`): solo si se necesita un valor que no existe. Nunca se usa directamente en componentes.
3. **Semántico** (`--color-<rol>`, `--space-*`…): el nombre describe el rol, nunca el color (`--color-primary`, no `--color-blue`).
4. Si es de color, defínelo en los **tres bloques**: tema claro, `[data-theme="dark"]` y la media query `prefers-color-scheme: dark`.
5. Si es un par texto/fondo, calcula su contraste y añádelo a la tabla de `brand-guidelines.md`. No documentes ratios sin calcularlos.

## Pendiente

- Mapear `--color-code-*` al tema del resaltador de código del blog.

- `tokens.json` (formato W3C DTCG) no se incluye en esta versión. Generarlo solo cuando se vayan a usar tokens en Figma o Penpot.
