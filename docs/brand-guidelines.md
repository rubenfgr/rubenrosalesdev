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
| Una sola familia tipográfica (Archivo) con eje de anchura | El contraste entre titulares (expandidos) y cuerpo (normal) sale del mismo archivo: menos peso de carga, coherencia total. |
| Monoespaciada del sistema, sin fuente adicional | El código aparece poco; no justifica cargar otra familia. |
| Radios de 2–6 px | Coherente con piezas talladas: precisas, no redondeadas como un producto de consumo. |
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
| `favicon.svg` | Pestaña del navegador y tamaños por debajo de 24 px. Versión simplificada sobre fondo propio. |

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
- `--color-accent` (esparto) es **decorativo**: filetes, marcadores, detalles. Nunca texto ni único indicador de estado (en tema claro no llega a 3:1).
- `--color-foreground-subtle` solo para texto grande (≥ 24 px, o ≥ 18,66 px en negrita) o información no esencial.
- El estado nunca se comunica solo con color: siempre acompañado de texto o icono.

### Contraste (WCAG 2.x)

Calculado a partir de los valores de `tokens.css`. Texto: AA ≥ 4,5:1, AAA ≥ 7:1, texto grande ≥ 3:1. Elementos de interfaz no textuales: ≥ 3:1.

### Tema claro

| Texto / elemento | Fondo | Ratio | Resultado |
|---|---|---|---|
| foreground (#2B3533) | background (#E6E8E3) | 10.25:1 | AAA |
| foreground (#2B3533) | surface (#F4F5F2) | 11.56:1 | AAA |
| foreground (#2B3533) | surface-alt (#D4D8D2) | 8.77:1 | AAA |
| foreground-muted (#5C6662) | background (#E6E8E3) | 4.82:1 | AA |
| foreground-muted (#5C6662) | surface (#F4F5F2) | 5.43:1 | AA |
| foreground-subtle (#7A847F) | background (#E6E8E3) | 3.13:1 | Solo texto grande |
| foreground-subtle (#7A847F) | surface (#F4F5F2) | 3.53:1 | Solo texto grande |
| primary (#285A6E) | background (#E6E8E3) | 6.13:1 | AA |
| primary (#285A6E) | surface (#F4F5F2) | 6.91:1 | AA |
| primary-foreground (#F4F5F2) | primary (#285A6E) | 6.91:1 | AA |
| secondary-foreground (#F4F5F2) | secondary (#4F5A3E) | 6.70:1 | AA |
| secondary (#4F5A3E) | background (#E6E8E3) | 5.94:1 | AA |
| success (#4F5A3E) | background (#E6E8E3) | 5.94:1 | AA |
| warning (#635234) | background (#E6E8E3) | 6.11:1 | AA |
| destructive (#8E3B26) | background (#E6E8E3) | 6.07:1 | AA |
| info (#214B5C) | background (#E6E8E3) | 7.65:1 | AAA |
| foreground-inverse (#F4F5F2) | foreground (#2B3533) | 11.56:1 | AAA |
| accent (#B79E6A) | background (#E6E8E3) | 2.10:1 | No cumple 3:1 |
| border-strong (#7A847F) | background (#E6E8E3) | 3.13:1 | Cumple 3:1 |
| focus (#285A6E) | background (#E6E8E3) | 6.13:1 | Cumple 3:1 |
| focus (#285A6E) | surface (#F4F5F2) | 6.91:1 | Cumple 3:1 |
| brand-piece (#285A6E) | background (#E6E8E3) | 6.13:1 | Cumple 3:1 |
| foreground (#2B3533) | info-surface (#EEF5F8) | 11.48:1 | AAA |
| info (#214B5C) | info-surface (#EEF5F8) | 8.56:1 | AAA |
| foreground (#2B3533) | success-surface (#F2F4EE) | 11.42:1 | AAA |
| success (#4F5A3E) | success-surface (#F2F4EE) | 6.62:1 | AA |
| foreground (#2B3533) | warning-surface (#F8F4EA) | 11.52:1 | AAA |
| warning (#635234) | warning-surface (#F8F4EA) | 6.86:1 | AA |
| foreground (#2B3533) | destructive-surface (#FAF0EC) | 11.29:1 | AAA |
| destructive (#8E3B26) | destructive-surface (#FAF0EC) | 6.68:1 | AA |
| code-foreground (#2B3533) | code-background (#F4F5F2) | 11.56:1 | AAA |
| code-comment (#5C6662) | code-background (#F4F5F2) | 5.43:1 | AA |
| code-keyword (#285A6E) | code-background (#F4F5F2) | 6.91:1 | AA |
| code-string (#4F5A3E) | code-background (#F4F5F2) | 6.70:1 | AA |
| code-number (#8E3B26) | code-background (#F4F5F2) | 6.84:1 | AA |
| code-function (#635234) | code-background (#F4F5F2) | 6.89:1 | AA |
| code-punctuation (#444F4C) | code-background (#F4F5F2) | 7.77:1 | AAA |

### Tema oscuro

| Texto / elemento | Fondo | Ratio | Resultado |
|---|---|---|---|
| foreground (#E6E8E3) | background (#1E2725) | 12.40:1 | AAA |
| foreground (#E6E8E3) | surface (#2B3533) | 10.25:1 | AAA |
| foreground (#E6E8E3) | surface-alt (#333E3B) | 8.99:1 | AAA |
| foreground-muted (#9AA39F) | background (#1E2725) | 5.91:1 | AA |
| foreground-muted (#9AA39F) | surface (#2B3533) | 4.89:1 | AA |
| foreground-subtle (#7A847F) | background (#1E2725) | 3.96:1 | Solo texto grande |
| foreground-subtle (#7A847F) | surface (#2B3533) | 3.27:1 | Solo texto grande |
| primary (#7FB0C2) | background (#1E2725) | 6.48:1 | AA |
| primary (#7FB0C2) | surface (#2B3533) | 5.36:1 | AA |
| primary-foreground (#1E2725) | primary (#7FB0C2) | 6.48:1 | AA |
| secondary-foreground (#1E2725) | secondary (#A9B68F) | 7.12:1 | AAA |
| secondary (#A9B68F) | background (#1E2725) | 7.12:1 | AAA |
| success (#A9B68F) | background (#1E2725) | 7.12:1 | AAA |
| warning (#CDB582) | background (#1E2725) | 7.67:1 | AAA |
| destructive (#D88A72) | background (#1E2725) | 5.68:1 | AA |
| info (#ADCFDC) | background (#1E2725) | 9.28:1 | AAA |
| foreground-inverse (#2B3533) | foreground (#E6E8E3) | 10.25:1 | AAA |
| accent (#B79E6A) | background (#1E2725) | 5.91:1 | Cumple 3:1 |
| border-strong (#7A847F) | background (#1E2725) | 3.96:1 | Cumple 3:1 |
| focus (#7FB0C2) | background (#1E2725) | 6.48:1 | Cumple 3:1 |
| focus (#7FB0C2) | surface (#2B3533) | 5.36:1 | Cumple 3:1 |
| brand-piece (#7FB0C2) | background (#1E2725) | 6.48:1 | Cumple 3:1 |
| foreground (#E6E8E3) | info-surface (#0E2029) | 13.53:1 | AAA |
| info (#ADCFDC) | info-surface (#0E2029) | 10.13:1 | AAA |
| foreground (#E6E8E3) | success-surface (#1C2117) | 13.30:1 | AAA |
| success (#A9B68F) | success-surface (#1C2117) | 7.64:1 | AAA |
| foreground (#E6E8E3) | warning-surface (#211B12) | 13.83:1 | AAA |
| warning (#CDB582) | warning-surface (#211B12) | 8.56:1 | AAA |
| foreground (#E6E8E3) | destructive-surface (#2A110B) | 14.38:1 | AAA |
| destructive (#D88A72) | destructive-surface (#2A110B) | 6.59:1 | AA |
| code-foreground (#E6E8E3) | code-background (#2B3533) | 10.25:1 | AAA |
| code-comment (#9AA39F) | code-background (#2B3533) | 4.89:1 | AA |
| code-keyword (#7FB0C2) | code-background (#2B3533) | 5.36:1 | AA |
| code-string (#A9B68F) | code-background (#2B3533) | 5.89:1 | AA |
| code-number (#D88A72) | code-background (#2B3533) | 4.70:1 | AA |
| code-function (#CDB582) | code-background (#2B3533) | 6.34:1 | AA |
| code-punctuation (#B9BFB9) | code-background (#2B3533) | 6.76:1 | AA |

Pares que **no** cumplen y cómo se usan: `accent` en tema claro (2,10:1) es solo decorativo. `foreground-subtle` queda restringido a texto grande en ambos temas.

### Gráficos

Orden de uso: `--chart-1` a `--chart-6` (sea-600, esparto-400, lichen-700, almagra-400, sea-300, stone-500).

Comprobado con simulación de protanopia, deuteranopia y tritanopia (matrices de Machado, distancia ΔE76): la separación mínima es ΔE 11,7, entre `chart-2` y `chart-4` en deuteranopia. Es distinguible pero ajustado, así que:

- No colocar `chart-2` y `chart-4` adyacentes.
- A partir de 4 series, etiquetar directamente en el gráfico en lugar de depender de la leyenda.

---

## 4. Tipografía

**Archivo** (Google Fonts, licencia SIL Open Font License), variable con ejes de peso y anchura. Monoespaciada: la del sistema.

| Rol | Tamaño | Anchura | Peso | Interlineado | Tracking |
|---|---|---|---|---|---|
| Display | `--font-size-display` (32→52 px) | 118 % | 620 | 1,1 | −0,015 em |
| H2 | `--font-size-h2` (26→36 px) | 118 % | 620 | 1,2 | −0,01 em |
| H3 | `--font-size-h3` (22→28 px) | 118 % | 620 | 1,2 | −0,01 em |
| H4 | `--font-size-h4` (19→22 px) | 100 % | 620 | 1,2 | 0 |
| Lead | `--font-size-lead` (18→20 px) | 100 % | 400 | 1,6 | 0 |
| Body | `--font-size-body` (16 px) | 100 % | 400 | 1,6 | 0 |
| Label | `--font-size-label` (14 px) | 100 % | 500 | 1,45 | 0 |
| Caption / metadatos | `--font-size-caption` (12,8 px) | 100 % | 400 | 1,45 | 0 |
| Código | `--font-size-label` | — | 400 | 1,6 | 0 |

- Escala fluida con `clamp()` entre 360 y 1440 px (ver `docs/design-system.md`). Los titulares tienen tope en pantallas grandes y el cuerpo nunca baja de 16 px.
- Pesos en uso: 400, 500 y 620. No añadir más.
- Longitud de línea máxima en texto corrido: `--measure` (66 caracteres).
- Cifras tabulares (`font-variant-numeric: tabular-nums`) en tablas, precios, fechas y cualquier dato que se compare en columna.
- Nunca mayúsculas sostenidas en etiquetas o titulares.

---

## 5. Espaciado, retícula y geometría

- **Unidad base:** 4 px. Escala `--space-1` (4) a `--space-10` (128).
- **Contenedor:** máximo 72 rem (1152 px); columnas de lectura de 42 rem. Margen lateral fluido `--container-padding`.
- **Retícula:** 12 columnas, gutter fluido de 16 a 32 px.
- **Breakpoints:** 40 rem (640), 64 rem (1024), 80 rem (1280).
- **Radios:** 2 px (etiquetas, campos pequeños), 4 px (campos, botones), 6 px (tarjetas, paneles). Sin radios mayores; `--radius-full` solo para elementos circulares.
- **Bordes:** 1 px por defecto, 2 px para énfasis y anillo de foco.
- **Elevación:** dos niveles de sombra suaves, tintadas en stone. Preferir borde a sombra para separar superficies.

**Composición:** mucho espacio entre secciones (`--space-8` a `--space-10`) y densidad moderada dentro de ellas. Alineación a la retícula, sin elementos flotando en ángulos. Como en un muro: piezas de tamaños distintos, juntas regulares.

---

## 6. Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | 120 ms | Hover, foco |
| `--duration-base` | 200 ms | Desplegables, cambios de estado |
| `--duration-slow` | 320 ms | Entrada de paneles |
| `--duration-ambient` | 120 s | Solo el motivo del hero |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Entradas |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transiciones de estado |

El movimiento es funcional: confirma una acción o explica un cambio. Sin animaciones de entrada al hacer scroll ni efectos de parallax.

**Única excepción ambiental:** el motivo hilada puede desplazarse muy lentamente en el fondo del hero (`--duration-ambient`, 120 s por ciclo, lineal), a baja opacidad. Solo en el hero, nunca detrás de texto de lectura largo, y con `animation: none` bajo `prefers-reduced-motion: reduce`. Si en pruebas con usuarios distrae, se elimina.

Con `prefers-reduced-motion: reduce` las duraciones funcionales pasan a 0.

---

## 7. Iconografía y motivos

### Iconos

[Lucide](https://lucide.dev), trazo `--icon-stroke` (1,5), tamaños 16, 20 y 24 px, color `currentColor`. Siempre de línea, sin rellenos. No mezclar con otras librerías.

### Motivo «hilada» (`src/assets/motifs/hilada.svg`)

Las juntas de un muro de piedra en seco como textura repetible (tile de 240 × 96).

- **Sí:** fondo de secciones amplias (cabecera, pie, separadores), portadas de documentos, fondos de redes sociales. Color `--color-border` en claro u oscuro.
- **No:** detrás de texto de lectura, en más de una zona por vista, combinado con fotografía, ni en color de marca.

### Fotografía

- **Sí:** luz natural, materiales reales, capturas reales de proyectos propios, espacios de trabajo reales (con permiso de quien aparezca).
- **No:** stock de robots, cerebros o redes de luces; oficinas corporativas genéricas; personas señalando pantallas; imágenes generadas que simulen proyectos o resultados.

---

## 8. Patrones de página

Patrones generales para la web. Los valores salen siempre de los tokens.

| Patrón | Regla |
|---|---|
| **Ritmo de secciones** | Separación vertical `--space-section` (64→128 px). Mucho aire entre secciones, densidad moderada dentro. |
| **Navegación fija** | Altura `--nav-height`, fondo `--color-background` opaco y borde inferior `--color-border` al hacer scroll. En la home, anclas a las secciones; en el resto, enlaces a páginas. Respeta safe-area en móvil. |
| **Apertura de sección** | Titular `h2` y entradilla de 1–2 frases (`--font-size-lead`, `--color-foreground-muted`, máximo `--measure`). Sin etiquetas decorativas encima del titular ni numeración. |
| **Demo de proceso** | Componente que muestra un proceso «antes / después» paso a paso (p. ej. pedido por email → extracción → validación → alta en ERP). El usuario avanza con botones; nada se reproduce solo. Siempre marcado como **ejemplo ilustrativo** si no es un caso real. |
| **Cifras** | Solo datos reales y verificables. Sin cifras, no hay fila de cifras. |
| **Pasos para empezar** | Máximo 3 pasos numerados, en lenguaje de cliente (llamada, propuesta, primera entrega). |
| **Letra pequeña honesta** | Cuando aplique, una nota breve sobre límites o cuándo no conviene algo. Refuerza la voz. |
| **Cierre** | Una frase y un único CTA. |

### Blog

Lectura tipo documentación (inspirado en Docusaurus):

- **Escritorio:** tres columnas (posts recientes · artículo · índice de contenidos). El artículo no supera `--measure`. Las columnas laterales son `position: sticky` bajo la navegación.
- **Móvil:** una columna; el índice se pliega al inicio del artículo y los recientes pasan al final.
- **Admoniciones** (`note`, `tip`, `warning`, `danger`): fondo `--color-*-surface`, borde izquierdo de 2 px en el color de estado, título con icono Lucide.
- **Código:** fondo `--color-code-background`, borde `--color-border`, radio `--radius-md`, tokens `--color-code-*` para el resaltado, título de archivo opcional y botón de copiar.

---

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
