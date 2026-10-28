# rubenrosales.dev — Guía de marca

Versión 1.0 · Fundamentos de identidad. Los tokens están en `src/styles/tokens.css`, que es la fuente de verdad; esta guía explica el porqué y las reglas de uso.

---

## 1. Concepto

**Piedra seca.** Los muros de piedra en seco del Mediterráneo se levantan sin argamasa: cada pieza se elige y se coloca con precisión, y por eso duran siglos. Es la forma de trabajar que transmite la marca: soluciones sólidas, sin nada superfluo, pensadas para mantenerse.

El mar entra como color (azul mar de fondo), no como ilustración. La naturaleza aparece en los materiales (caliza, granito, liquen, esparto), no en hojas ni iconos eco.

Debe transmitir: rigor técnico, claridad, cercanía, fiabilidad y durabilidad.

### Decisiones clave

| Decisión | Motivo |
|---|---|
| Neutros mineral verdoso en vez de blanco y negro | Da carácter mediterráneo sin recurrir a colores llamativos; evita el aspecto de plantilla SaaS. |
| Azul mar de fondo como único color con intención | Un solo color de acción hace la interfaz predecible; el azul aporta fiabilidad sin el tono corporativo del azul eléctrico. |
| Archivo con eje de anchura para titulares (118 %) | El contraste entre titulares expandidos y cuerpo normal sale del mismo archivo: sin peso de carga extra. |
| JetBrains Mono para cifras y metadatos | Las cifras y las etiquetas técnicas son parte de la voz del sitio (plano técnico). Una variable `wght` latin pesa unos 40 KB (OFL). |
| Esquinas rectas, reglas de 2 px y sin sombras | Piezas talladas: aristas vivas y juntas visibles. La profundidad la dan la regla y el color, no el desenfoque. |
| Símbolo sin iniciales | Un símbolo con concepto propio es más reconocible y no depende del nombre. |

---

## 2. Logo

### Símbolo «Encaje»

Un muro de tres hiladas con un hueco en la esquina superior derecha y la pieza azul que llega a ocuparlo. Representa un sistema que coloca cada parte en su sitio: la automatización y la IA como lo que completa un trabajo bien construido, no como protagonistas.

**Construcción** (retícula de 84 × 84 unidades):

- Tres hiladas de 23–24 u de alto, con juntas de 4 u.
- Las piezas de cada hilada tienen anchos distintos y juntas desalineadas entre hiladas, como un muro real.
- La pieza azul mide 22 × 23 u, igual que el hueco, y está desplazada +6 u a la derecha y −6 u hacia arriba respecto a él.

### Wordmark

«Rubén Rosales» en Archivo, anchura 118 %, peso 620, tracking −0,01 em, con el kerning de la fuente. Está convertido a trazados: los SVG no dependen de que la fuente esté cargada.

### Archivos

| Archivo | Uso |
|---|---|
| `logo-horizontal.svg` | Fondos claros. Uso principal. |
| `logo-horizontal-inverse.svg` | Fondos oscuros. |
| `logo-horizontal-mono.svg` | Un solo color (`currentColor`): impresión a una tinta, grabados, sellos. |
| `symbol.svg` / `symbol-inverse.svg` | Avatares, perfiles sociales, espacios cuadrados. |
| `symbol-mono.svg` | Símbolo a una tinta (`currentColor`). |
| `favicon.svg` | Pestaña del navegador y tamaños por debajo de 24 px. Versión simplificada sobre fondo propio, cuadrado y sin radio (como el resto de la geometría). |
| `public/og-es.png`, `public/og-en.png` | Imagen para compartir (1200 × 630): titular del hero a 118 %, punto en `--color-signal`, hilada en la esquina. Se regenera con `node scripts/og/render.mjs` desde `apps/web` (plantilla en `scripts/og/og.html`). |

### Descriptor

«Software, automatización e IA» (provisional). **No forma parte de los archivos de logo**: se compone como texto HTML junto al logo, en `--font-size-label` y `--color-foreground-muted`, para poder cambiarlo sin rehacer el logo.

### Área de respeto

Alrededor de los límites visibles del logo, dejar como mínimo la **altura de la pieza azul** (23 u, unos 27 % de la altura del símbolo) en los cuatro lados.

### Tamaños mínimos

| Versión | Mínimo |
|---|---|
| Logo horizontal | 160 px de ancho (la altura de mayúsculas queda en unos 11 px) |
| Símbolo completo | 24 px |
| Por debajo de 24 px | `favicon.svg` |

### Color

- Muro y wordmark: `--color-brand-mark`.
- Pieza: `--color-brand-piece`. Es la única parte del logo que lleva color.
- Versión monocolor: todo en un mismo color; la pieza se sigue leyendo por su desplazamiento.

### Usos incorrectos

- Colocar la pieza dentro de su hueco, o moverla a otra posición.
- Colorear otras piezas del muro, o la pieza en un color distinto al de marca.
- Añadir nodos, líneas, brillos, chispas o cualquier elemento «IA».
- Aplicar gradientes, sombras, contornos o efectos.
- Rotar, deformar o cambiar proporciones.
- Recomponer el wordmark con otra fuente o en minúsculas.
- Colocarlo sobre fotografía sin contraste suficiente; usar la versión inversa o mono sobre una zona uniforme.

---

## 3. Color

### Familias

| Familia | Papel | Base |
|---|---|---|
| Stone | Neutros: fondos, texto, bordes | Caliza `#E6E8E3`, Pizarra `#2B3533` |
| Sea | Primario: acciones, enlaces, foco, pieza del logo | `#285A6E` (claro) / `#7FB0C2` (oscuro) |
| Lichen | Secundario y éxito | `#4F5A3E` (claro) / `#A9B68F` (oscuro) |
| Esparto | Acento cálido decorativo y aviso | `#B79E6A` |
| Almagra | Error y acciones destructivas | `#8E3B26` (claro) / `#D88A72` (oscuro) |

### Reglas

- Los componentes usan solo tokens semánticos (`--color-*`), nunca primitivos.
- Un solo color de acción por vista: `--color-primary`.
- `--color-accent` (esparto) es **decorativo**: filetes, marcadores, detalles. Nunca texto ni único indicador de estado (no llega a 3:1 sobre papel).
- **Un gesto cálido por pantalla**: `--color-signal` (almagra, 5,20:1 sobre papel) se reserva para una sola cifra o subrayado clave. Sobre petróleo, el equivalente es `--color-bleed-accent` (esparto claro).
- **Al menos una sección a sangre** en petróleo profundo (`--color-bleed`, texto `--color-bleed-text`). Sin degradados: el color es plano.
- `--color-foreground-subtle` (4,51:1 sobre papel) es el texto más suave admitido, también en tamaños pequeños; `--color-foreground-faint` es solo decorativo (bordes, puntos), nunca texto.
- El estado nunca se comunica solo con color: siempre acompañado de texto o icono.

### Contraste (WCAG 2.x)

Calculado a partir de los valores de `tokens.css` (tema claro, el único). Texto: AA ≥ 4,5:1, AAA ≥ 7:1, texto grande ≥ 3:1. Elementos de interfaz no textuales: ≥ 3:1.

| Texto / elemento | Fondo | Ratio | Resultado |
|---|---|---|---|
| foreground (#1E2725) | background (#F4F5F2) | 13.99:1 | AAA |
| foreground (#1E2725) | surface (#FFFFFF) | 15.30:1 | AAA |
| foreground (#1E2725) | surface-alt (#ECEEE9) | 13.10:1 | AAA |
| foreground-muted (#5E6865) | background (#F4F5F2) | 5.27:1 | AA |
| foreground-muted (#5E6865) | surface (#FFFFFF) | 5.76:1 | AA |
| foreground-muted (#5E6865) | surface-alt (#ECEEE9) | 4.93:1 | AA |
| foreground-subtle (#667370) | background (#F4F5F2) | 4.51:1 | AA |
| primary (#285A6E) | background (#F4F5F2) | 6.91:1 | AA |
| primary (#285A6E) | surface (#FFFFFF) | 7.56:1 | AAA |
| primary-foreground (#FFFFFF) | primary (#285A6E) | 7.56:1 | AAA |
| secondary (#4F5A3E) | background (#F4F5F2) | 6.70:1 | AA |
| warning (#635234) | background (#F4F5F2) | 6.89:1 | AA |
| destructive (#8E3B26) | background (#F4F5F2) | 6.84:1 | AA |
| info (#214B5C) | background (#F4F5F2) | 8.62:1 | AAA |
| signal (#A84A31) | background (#F4F5F2) | 5.20:1 | AA |
| signal (#A84A31) | surface (#FFFFFF) | 5.69:1 | AA |
| signal-foreground (#FFFFFF) | signal (#A84A31) | 5.69:1 | AA |
| bleed-text (#F4F5F2) | bleed (#152F3A) | 12.80:1 | AAA |
| bleed-text-muted (#ADCFDC) | bleed (#152F3A) | 8.49:1 | AAA |
| bleed-accent (#CDB582) | bleed (#152F3A) | 7.02:1 | AAA |
| accent (#B79E6A) | background (#F4F5F2) | 2.37:1 | Decorativo, no cumple 3:1 |
| border-strong (#C9CDC6) | background (#F4F5F2) | 1.47:1 | Decorativo, no cumple 3:1 |
| rule (#1E2725) | background (#F4F5F2) | 13.99:1 | Cumple 3:1 |
| focus (#285A6E) | background (#F4F5F2) | 6.91:1 | Cumple 3:1 |
| focus (#285A6E) | surface (#FFFFFF) | 7.56:1 | Cumple 3:1 |
| foreground (#1E2725) | info-surface (#EEF5F8) | 13.88:1 | AAA |
| info (#214B5C) | info-surface (#EEF5F8) | 8.56:1 | AAA |
| foreground (#1E2725) | success-surface (#F2F4EE) | 13.81:1 | AAA |
| secondary (#4F5A3E) | success-surface (#F2F4EE) | 6.62:1 | AA |
| foreground (#1E2725) | warning-surface (#F8F4EA) | 13.93:1 | AAA |
| warning (#635234) | warning-surface (#F8F4EA) | 6.86:1 | AA |
| foreground (#1E2725) | destructive-surface (#FAF0EC) | 13.66:1 | AAA |
| destructive (#8E3B26) | destructive-surface (#FAF0EC) | 6.68:1 | AA |
| code-foreground (#2B3533) | code-background (#F4F5F2) | 11.56:1 | AAA |
| code-comment (#5C6662) | code-background (#F4F5F2) | 5.43:1 | AA |
| code-keyword (#285A6E) | code-background (#F4F5F2) | 6.91:1 | AA |
| code-string (#4F5A3E) | code-background (#F4F5F2) | 6.70:1 | AA |
| code-number (#8E3B26) | code-background (#F4F5F2) | 6.84:1 | AA |
| code-function (#635234) | code-background (#F4F5F2) | 6.89:1 | AA |
| code-punctuation (#444F4C) | code-background (#F4F5F2) | 7.77:1 | AAA |

Pares que **no** cumplen y cómo se usan:

- `accent` (esparto, 2,37:1) y `border-strong` (1,47:1) son solo decorativos. Un campo de formulario necesita un borde de 3:1: usar `--color-rule` o `--color-foreground-muted`, no `--color-border-strong`.
- El tema oscuro se ha eliminado: la web es solo clara. Las secciones oscuras son paneles (`--color-dark-*`) o la sección a sangre (`--color-bleed-*`), con los pares de arriba.

### Gráficos

Orden de uso: `--chart-1` a `--chart-6` (sea-600, esparto-400, lichen-700, almagra-400, sea-300, stone-500).

Comprobado con simulación de protanopia, deuteranopia y tritanopia (matrices de Machado, distancia ΔE76): la separación mínima es ΔE 11,7, entre `chart-2` y `chart-4` en deuteranopia. Es distinguible pero ajustado, así que:

- No colocar `chart-2` y `chart-4` adyacentes.
- A partir de 4 series, etiquetar directamente en el gráfico en lugar de depender de la leyenda.

---

## 4. Tipografía

**Archivo** (autoalojada, licencia SIL Open Font License), variable con ejes de peso y anchura (`wdth` 62–125 %). **JetBrains Mono** (autoalojada, OFL), variable con eje de peso, solo para cifras y metadatos.

| Rol | Tamaño | Anchura | Peso | Interlineado | Tracking |
|---|---|---|---|---|---|
| Hero (h1 de la home) | `--font-size-hero` (36→84 px) | 100 % | 800 | 0,94 | −0,04 em |
| Título de sección (h2 de la home) | `--font-size-section` (32→72 px) | 118 % (100 % bajo 26 rem) | 800 | 1 | −0,04 em |
| Display (h1 interior) | `--font-size-display` (36→68 px) | 118 % (100 % bajo 26 rem) | 620 | 1,1 | −0,02 em |
| H2 | `--font-size-h2` (28→44 px) | 118 % | 620 | 1,2 | −0,01 em |
| H3 | `--font-size-h3` (22→28 px) | 100 % | 620 | 1,2 | −0,01 em |
| H4 | `--font-size-h4` (19→22 px) | 100 % | 620 | 1,2 | 0 |
| Cifra | `--font-size-figure` (48→88 px) | 100 % | 800 | 1 | −0,04 em |
| Lead | `--font-size-lead` (18→20 px) | 100 % | 400 | 1,6 | 0 |
| Body | `--font-size-body` (16 px) | 100 % | 400 | 1,6 | 0 |
| Label | `--font-size-label` (14 px) | 100 % | 500 | 1,45 | 0 |
| Caption / metadatos | `--font-size-caption` (12,8 px) | 100 % | 400 | 1,45 | 0 |
| Mono (cifras, metadatos) | `--font-size-mono` (12 px) | — | 400–500 | 1,45 | 0,06 em |
| Código | `--font-size-label` | — | 400 | 1,6 | 0 |

- Escala fluida con `clamp()` entre 360 y 1440 px (ver `docs/design-system.md`). Los titulares tienen tope en pantallas grandes y el cuerpo nunca baja de 16 px.
- **Por qué 118 % solo en h1 interiores y h2 (no en el hero):** el ancho expandido da carácter a los titulares, pero en tarjetas y demos (h3) ocupa demasiado y parte palabras. Por debajo de 26 rem (416 px) los titulares vuelven a 100 %.
- Pesos en uso: 400, 500, 620 y 800 (titulares y cifras). No añadir más.
- Longitud de línea máxima en texto corrido: `--measure` (66 caracteres).
- Cifras tabulares (`font-variant-numeric: tabular-nums`) en tablas, precios, fechas y cualquier dato que se compare en columna.
- Nunca mayúsculas sostenidas en titulares. En etiquetas mono cortas (≤ 3 palabras) sí se admiten.

## 5. Espaciado, retícula y geometría

- **Unidad base:** 4 px. Escala `--space-1` (4) a `--space-10` (128).
- **Contenedor:** máximo 80 rem (1280 px, `--container-max`); columnas de lectura de 42 rem. Margen lateral fluido `--container-padding`.
- **Retícula:** 12 columnas, gutter fluido de 16 a 32 px.
- **Breakpoints:** 40 rem (640), 64 rem (1024), 80 rem (1280).
- **Radios:** 0. Esquinas rectas en todo (`--radius-sm/md/lg` valen 0). `--radius-full` solo para elementos circulares.
- **Bordes:** 1 px (`--color-border`) para separar contenido, 2 px (`--color-rule`, tinta) para estructura: reglas entre secciones, cabeceras de bloque y anillo de foco.
- **Elevación:** ninguna. Sin sombras (los tokens `--shadow-*` valen `none`, salvo `--shadow-focus`). La jerarquía la dan el color, la regla y la escala.
- **Por qué:** esquinas rectas y reglas visibles leen como plano técnico y piedra tallada. Una geometría única es más reconocible que radios suaves con sombra, que es lo que producen las plantillas por defecto.

**Composición:** mucho espacio entre secciones (`--space-8` a `--space-10`) y densidad moderada dentro de ellas. Alineación a la retícula, sin elementos flotando en ángulos. Como en un muro: piezas de tamaños distintos, juntas regulares.

---

## 6. Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | 120 ms | Hover, foco |
| `--duration-base` | 200 ms | Desplegables, cambios de estado |
| `--duration-slow` | 320 ms | Entrada de paneles |
| `--duration-ambient` | 120 s | Sin uso (el motivo es estático) |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Entradas |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transiciones de estado |

El movimiento es funcional: confirma una acción, explica un cambio o marca la apertura de una sección. Todo es CSS o JS mínimo, solo `transform` y `opacity` (sin saltos de layout), y desaparece con `prefers-reduced-motion: reduce`.

**Movimiento permitido (v2):**

- **Apertura de sección.** Al entrar una sección en el viewport, la regla de 2 px se dibuja de izquierda a derecha (700 ms) y el titular sube 0,3 em mientras aparece (600 ms, con 150 ms de retraso). Una sola vez por sección. Lo que ya está en pantalla al cargar no se anima.
- **Estados de las demos** (flujos, índice del hero, calculadora): cambios de estado de 120 a 320 ms, y la rotación del índice del hero (3 s por paso), que se pausa al pasar el cursor o enfocar.
- **Microinteracciones:** la flecha de los botones se desplaza 4 px, los enlaces dentro de texto engordan el subrayado de 2 a 4 px y el botón principal se invierte a tinta.
- **Scroll a anclas:** `scroll-behavior: smooth` solo con `prefers-reduced-motion: no-preference`. No hay scroll suave por JS (se eliminó Lenis).

**Sigue prohibido:** parallax, animar bloques de contenido al hacer scroll (solo la apertura de sección), animaciones largas o en bucle detrás de texto, y contadores que sustituyan a la cifra real.

**Excepción ambiental retirada:** el motivo hilada ya no se desplaza en el hero; es estático (`--duration-ambient` queda sin uso).

Con `prefers-reduced-motion: reduce` las duraciones funcionales pasan a 0 y no se activa el reveal.

---

## 7. Iconografía y motivos

### Iconos

[Lucide](https://lucide.dev), trazo `--icon-stroke` (1,5), tamaños 16, 20 y 24 px, color `currentColor`. Siempre de línea, sin rellenos. No mezclar con otras librerías.

### Motivo «hilada» (`src/assets/motifs/hilada.svg`)

Las juntas de un muro de piedra en seco como textura repetible (tile de 240 × 96).

- **Sí:** divisor de sección y de pie (`.hilada` en `global.css`: máscara del SVG sobre un color de token, con `--hilada-color` y `--hilada-height`), fondo de bloques a sangre, portadas de documentos y redes sociales.
- **No:** detrás de texto de lectura, combinado con fotografía, ni en color de marca (los divisores usan `--color-border-strong` o `--color-dark-border`).
- **Cambio v2:** deja de ser una textura discreta y pasa a ser estructura: la home la usa como divisor al cerrar el hero y como remate del pie. Ya no hay límite de una zona por vista, pero sí de una por transición de sección.

### Fotografía

- **Sí:** luz natural, materiales reales, capturas reales de proyectos propios, espacios de trabajo reales (con permiso de quien aparezca).
- **No:** stock de robots, cerebros o redes de luces; oficinas corporativas genéricas; personas señalando pantallas; imágenes generadas que simulen proyectos o resultados.

---

## 8. Patrones de página

Patrones generales para la web. Los valores salen siempre de los tokens.

| Patrón | Regla |
|---|---|
| **Ritmo de secciones** | Separación vertical `--space-section` (64→128 px). Mucho aire entre secciones, densidad moderada dentro. |
| **Navegación fija** | Altura `--nav-height`, fondo `--color-background` opaco (sin desenfoque) y regla inferior de 2 px (`--color-rule`) siempre visible. Enlaces con subrayado de 2 px en hover/actual. En la home, anclas a las secciones; en el resto, enlaces a páginas. Respeta safe-area en móvil. |
| **Apertura de sección** | Regla de 2 px (`--color-rule`) con el número de sección en mono (sin etiqueta de texto), titular `h2` y entradilla de 1–2 frases (`--font-size-lead`, `--color-foreground-muted`, máximo `--measure`). La segunda parte del titular va en `--color-primary` (en `--color-bleed-text-muted` sobre petróleo), nunca en gris. El número es estructura, no decoración; no se añade ninguna otra etiqueta. |
| **Secciones a sangre** | Problema y el bloque 1.2 de Servicios van en petróleo profundo (`--color-bleed`), con paneles en `--color-bleed-panel`, reglas de 2 px en `--color-bleed-text` y el motivo hilada en `--color-bleed-rule`. El cuadro «Datos extraídos» de 1.2 lleva cabecera invertida (`--color-bleed-text` sobre petróleo) y borde de 2 px para que destaque del fondo. El resultado de la calculadora va en `--color-primary` con rejilla tenue y recuadros de fondo suave (blanco al 8 %), no en petróleo. |
| **Hero y Servicios** | El hero son dos bloques horizontales a partir de 64 rem: titular, entradilla y botones a la izquierda, índice numerado a la derecha, centrados entre sí. «solos» va en `--color-primary` y el punto en `--color-signal`. En Servicios, cada fila (1.1–1.4) centra verticalmente el texto y el ejemplo uno respecto al otro. |
| **Listas y preguntas** | Filas separadas por regla de 2 px, no tarjetas con borde (FAQ, índice de servicios del hero). El estado abierto o activo se marca con fondo, no con color de borde. |
| **Demo de proceso** | Componente que muestra un proceso «antes / después» paso a paso (p. ej. pedido por email → extracción → validación → alta en ERP). El usuario avanza con botones; nada se reproduce solo. Siempre marcado como **ejemplo ilustrativo** si no es un caso real. |
| **Cifras** | Solo datos reales y verificables. Sin cifras, no hay fila de cifras. En mono (`--font-family-mono`), peso 700. |
| **Pasos para empezar** | Máximo 3 pasos numerados, en lenguaje de cliente (llamada, propuesta, primera entrega). |
| **Letra pequeña honesta** | Cuando aplique, una nota breve sobre límites o cuándo no conviene algo. Refuerza la voz. |
| **Cierre** | Una frase y un único CTA. |

### Blog

Lectura tipo documentación (inspirado en Docusaurus), con carácter editorial en el índice:

- **Buscador y filtros** (encima del listado, solo con JS; sin JS el listado paginado funciona igual):
  - Buscador libre: busca en título, descripción, etiquetas y texto del artículo, sin distinguir mayúsculas ni tildes; todas las palabras deben aparecer y el título pesa más. Máximo 100 caracteres. Escape borra.
  - Etiquetas de selección múltiple (botones con `aria-pressed`): para que salga un artículo deben estar todas las elegidas. Cada etiqueta muestra cuántos artículos quedarían al añadirla y se desactiva si no quedaría ninguno.
  - Con filtros activos, el listado estático se oculta y los resultados salen paginados en el cliente (10 por página). Sin filtros, la paginación sigue siendo la de las páginas reales (`/blog/pagina/N`).
  - El estado vive en la URL (`?q=…&tag=a&tag=b&p=2`) para poder compartir una búsqueda. El índice es `/blog/search.json` (y `/en/blog/search.json`), con el texto plano de cada artículo recortado a 6.000 caracteres; se descarga al primer uso.
- **Índice:** una fila por artículo, separadas por regla de 2 px (`--color-rule`). A la izquierda, fecha y tiempo de lectura en mono; a la derecha, titular (`--font-size-h3`, peso 800), descripción y etiquetas en mono con `#`. Sin tarjeta destacada. El título de página usa `--font-size-section`.
- **Artículo, escritorio:** tres columnas (posts recientes · artículo · índice de contenidos). El artículo no supera `--measure`. Las columnas laterales son `position: sticky` bajo la navegación. Titular a peso 800 sobre una regla de 2 px; los `h2` del cuerpo llevan regla de 2 px encima (salvo el primero).
- **Artículo, móvil:** una columna; el índice se pliega al inicio y los recientes pasan al final.
- **Portada:** borde de 2 px (`--color-rule`), sin radio.
- **Admoniciones** (`note`, `tip`, `warning`, `danger`): fondo `--color-*-surface`, borde izquierdo de 2 px en el color de estado, título con icono Lucide.
- **Código:** fondo `--color-code-background`, borde de 2 px `--color-rule`, sin radio ni sombra, tokens `--color-code-*` para el resaltado, título de archivo opcional y botón de copiar.
- **Ficha de proyecto:** a 64 rem o más, dos columnas: a la izquierda cabecera fija (contexto en mono, titular a `--font-size-display`, entradilla, pila en mono); a la derecha, el contenido con reglas de 2 px sobre cada sección. En móvil, una columna.
- **Páginas legales:** titular a `--font-size-display` sobre regla de 2 px; los apartados llevan una regla de 1 px. No llevan más recursos gráficos: es texto de lectura.

## 9. Voz y tono

Habla una persona, no una empresa: alguien que entiende de tecnología y la explica sin jerga.

| Principio | Así sí | Así no |
|---|---|---|
| **Primera persona** | «Reviso tu proceso antes de proponer nada.» | «Nuestro equipo de expertos analiza tus necesidades.» |
| **Claridad antes que jerga** | «Las citas se confirman solas por WhatsApp.» | «Orquestamos flujos omnicanal impulsados por IA.» |
| **Sin promesas que no se puedan comprobar** | «Calculamos juntos cuánto tiempo te ahorraría.» | «Ahorra un 80 % de tu tiempo desde el primer día.» |
| **Honestidad sobre el alcance** | «Para esto no necesitas IA; basta con una automatización sencilla.» | «La IA lo resuelve todo.» |
| **Cercanía con criterio** | «Si no tiene sentido hacerlo, te lo diré.» | «¡Transformamos tu negocio para siempre! 🚀» |

**Reglas:**

- Nunca inventar clientes, proyectos, cifras, testimonios ni certificaciones.
- Sin urgencias falsas ni superlativos («el mejor», «revolucionario», «líder»).
- Sin emojis en comunicación de marca.
- Contenido externo: formal-profesional, pero sin lenguaje corporativo.
