# Proyecto insignia: agente de pedidos con revisión humana

Estado: **tarea para más adelante, fuera de este repositorio**. Rubén la hará en otro repo, y solo cuando esta web esté del todo montada. Aquí no se implementa nada: ni `apps/agent` ni ninguna página de este proyecto. Cuando exista el repo con código y capturas reales, entonces se enlazará desde la web; hasta entonces no se escribe ni una línea de contenido sobre él.

Pendiente de decidir cuando se retome: el caso y el alcance (§2), si el repo será público, si se empieza sin cuenta de Sentry (§4; por ahora sin cuenta) y el tope de coste (§5; se usaría la clave de Gemini de desarrollo ya existente).

## 1. Objetivo

Una pieza de portfolio que enseñe, con código y capturas reales, cómo construyo un sistema con agentes de IA «que se pueda operar»: se ve qué hace, se sabe cuándo falla, se mide si responde bien y se despliega siempre igual.

Es un **proyecto de demostración propio**: usa datos sintéticos (clientes, artículos y emails inventados y declarados como tales) y no representa a ningún cliente. En la web irá etiquetado «Proyecto de demostración» / «Demo project». No se publica ninguna cifra que no salga de una ejecución real que se pueda repetir con el repositorio.

Encaja con lo que la web ya cuenta: la sección «02 / control» explica que la IA pregunta cuando no está segura. Este proyecto es esa idea hecha de verdad, con umbrales configurables.

## 2. Alcance mínimo del MVP

**Qué hace el agente.** Recibe un email de pedido (texto, en español) y decide:

1. Extraer cliente, artículos y cantidades.
2. Comprobarlos contra un catálogo y una lista de clientes sintéticos (herramientas, ver más abajo).
3. Si todo cuadra y la confianza supera el umbral del modo, **crea el pedido** en un «ERP» de mentira (una tabla).
4. Si no (artículo desconocido, cantidad inusual, cliente ambiguo, petición fuera de regla), lo **deja en una cola de revisión** con el motivo. Una persona lo aprueba o lo rechaza.

**Herramientas del agente** (llamadas a funciones con esquema Zod, lista cerrada):

| Herramienta | Qué hace | Efecto |
|---|---|---|
| `buscar_cliente` | Busca por nombre o email en la tabla de clientes | Solo lectura |
| `buscar_articulo` | Busca por nombre o referencia en el catálogo | Solo lectura |
| `consultar_historial` | Pedidos anteriores del cliente (para detectar cantidades raras) | Solo lectura |
| `crear_pedido` | Inserta el pedido en la tabla `pedidos` | Escribe; solo si pasa las validaciones de código |
| `enviar_a_revision` | Deja el caso en la cola con el motivo | Escribe |

El agente **no envía emails ni toca nada fuera de su base de datos**. El límite de lo que puede hacer lo marca el código, no el prompt.

**Qué se observa:**

- **Logs estructurados** (JSON) con identificador de ejecución, herramienta, duración y resultado. Sin el cuerpo del email ni datos personales; los datos son sintéticos pero el hábito se mantiene.
- **Trazas**: una por ejecución, con un tramo por llamada al modelo y por herramienta (OpenTelemetry).
- **Métricas**: ejecuciones, pedidos creados frente a enviados a revisión, errores, latencia, tokens y coste estimado.
- **Panel** (Grafana) con esas métricas y enlace a la traza.
- **Errores**: ver §4.

**Evaluaciones y guardarraíles:**

- Conjunto de evaluación de unos 30 emails sintéticos con el resultado esperado (incluye casos difíciles: cantidades absurdas, artículo inexistente, instrucciones escondidas en el email). Mide acierto en cliente, artículos, decisión (crear/revisar) y falsos positivos (crear algo que debía revisarse, que es el error caro).
- Guardarraíles en código: salida del modelo validada con Zod (si no cumple, se reintenta una vez y si no, a revisión); herramientas en lista cerrada; máximo de pasos por ejecución; tope de tokens y de coste diario (si se supera, el agente se para y todo va a revisión); `crear_pedido` rechaza lo que no cuadre con el catálogo aunque el modelo insista; el contenido del email se trata como dato, nunca como instrucción (casos de prueba de inyección de prompt).
- Pruebas: unitarias (validaciones, umbrales), de herramientas contra una base de datos de prueba, y de evaluación.

**Fuera del MVP** (para no inflarlo): lectura real de buzones, adjuntos PDF, varios agentes, interfaz de usuario elaborada (la cola de revisión será una página mínima), autenticación de usuarios, multiidioma del agente.

## 3. Arquitectura

```
email de ejemplo ──▶ API del agente (Node + TypeScript, Hono)
                       │  bucle: modelo ⇄ herramientas (máx. N pasos)
                       │        └─ validación Zod + reglas en código
                       ├──▶ Postgres: clientes, catálogo, pedidos, cola de revisión
                       ├──▶ logs JSON (stdout)
                       ├──▶ trazas OTLP ──▶ Jaeger
                       ├──▶ /metrics ◀── Prometheus ──▶ Grafana (panel)
                       └──▶ errores ──▶ sumidero configurable (§4)
```

Se reutiliza lo que ya hay en el monorepo: Hono, Postgres, Drizzle, Zod en `packages/shared`, el cliente de Gemini con medición de tokens y tope de gasto de `apps/api`, y el arnés de evaluación de `apps/api/evals`. El código nuevo viviría en **`apps/agent`** (decisión tuya, ver §7) con un `docker-compose` propio que añade Jaeger, Prometheus y Grafana.

## 4. Tecnologías propuestas

Solo se mencionará en la web lo que acabe en el repositorio.

| Necesidad | Propuesta | Motivo / alternativa |
|---|---|---|
| Modelo | Gemini 3.5 Flash-Lite (ya en producción para el asistente) | Mismo proveedor y tarifa ya verificados; llamada a funciones nativa |
| API y datos | Hono, Postgres, Drizzle | Ya en el repo |
| Logs | `pino` (JSON) | Ligero y estándar |
| Trazas y métricas | OpenTelemetry SDK para Node, Jaeger y Prometheus | Estándar abierto, sin cuenta ni coste, corre en local |
| Panel | Grafana con el dashboard versionado en el repo | Sin cuenta |
| Errores | **Dos vías**, la misma interfaz `captureError()` | Ver abajo |
| Evaluaciones | Arnés propio sobre Vitest (como `apps/api/evals`) | Sin dependencia nueva; Promptfoo es una alternativa si hiciera falta |
| CI | GitHub Actions (ya hay `ci.yml`): tipos, tests, evaluación **sin llamadas reales** (respuestas del modelo grabadas) y build de la imagen | La evaluación en vivo es manual, para no gastar |
| Contenedores | `Dockerfile` multi-etapa y `docker-compose`; imagen publicada en GHCR desde Actions | GHCR va con la cuenta de GitHub que ya tienes |

**Seguimiento de errores, dos opciones:**

- **A. Sentry (nube).** Necesita que **tú crees la cuenta** y me pases el DSN como variable de entorno (`SENTRY_DSN`). El plan gratuito basta para una demo (límites a confirmar en su documentación en el momento de crearla). Yo no creo la cuenta.
- **B. Sin cuenta (por defecto).** Los errores se registran como eventos en la traza y como log estructurado de nivel `error`, con un panel de errores en Grafana. Opcionalmente, GlitchTip autoalojado (compatible con el SDK de Sentry) en un perfil de compose, a costa de más contenedores (Postgres y Redis propios). Si más adelante creas la cuenta de Sentry, activarlo es poner una variable.

Recomiendo **empezar con B** y dejar A como una línea de configuración: así el proyecto se puede arrancar con un solo comando y sin cuentas.

## 5. Coste

- **Producción: 0 €.** No se despliega nada nuevo en el VPS. El proyecto corre en local y en CI; la web solo publica una página con capturas reales y enlaces. (El VPS tiene 2,7 GiB de RAM libres; Jaeger, Prometheus y Grafana no caben con holgura junto a lo que ya corre, y no es el sitio.)
- **LLM, estimación (a medir):** con las tarifas verificadas en `docs/backend.md` (0,30 USD por millón de tokens de entrada, 2,50 de salida) y suponiendo unas 3 llamadas por ejecución de ~1.500 tokens de entrada y ~300 de salida, una ejecución cuesta del orden de **0,004 USD**. Una pasada de evaluación en vivo de 30 casos sería de **~0,15 USD**. El desarrollo completo debería quedar por debajo de **5 USD**. Son estimaciones: el coste real se medirá y quedará documentado.
- **Techo duro:** `AGENT_LLM_DAILY_BUDGET_EUR` (por defecto 0,50 €) y clave **distinta** a la del asistente, para que un descontrol de la demo no consuma el tope del asistente en producción. La clave sigue las reglas del repo: solo en variables de entorno.
- Nivel de pago de la API: como en el asistente, los datos sintéticos permiten incluso usar el nivel gratuito para pruebas locales (nunca con datos reales).
- Sin dependencias de pago ni cuentas nuevas. GHCR, Actions y Grafana/Jaeger/Prometheus locales no cuestan.

## 6. Plan por pasos

Cada paso es un commit pequeño (o varios) en una rama propia y termina con tipos, tests y build en verde.

1. **Esqueleto:** `apps/agent`, esquema de datos y datos sintéticos (clientes, catálogo, historial), herramientas con sus pruebas.
2. **Agente:** bucle con Gemini, validación Zod, reglas de `crear_pedido`, umbrales por modo (los mismos tres de la web), cola de revisión mínima.
3. **Guardarraíles:** límite de pasos, tope de coste, casos de inyección y de salida inválida, con pruebas.
4. **Evaluaciones:** 30 casos, métricas de acierto y falsos positivos, ejecución con respuestas grabadas en CI y en vivo a mano.
5. **Observabilidad:** logs, trazas, métricas, dashboard de Grafana versionado, `captureError()` con el sumidero de la opción B.
6. **Contenedores y CI:** Dockerfile, compose, workflow de build y publicación de imagen, prueba de arranque con un solo comando.
7. **Página en la web (es/en):** `proyectos/<slug>` con el problema, la arquitectura, las decisiones y las capturas **reales** del panel y de una traza, más los resultados de la evaluación que haya medido. Etiquetada como proyecto de demostración. Más el alta del proyecto en `content/projects`.
8. **Proyectos de ejemplo breves** (ver §8).

Orden orientativo de esfuerzo: pasos 1 a 6 son la parte grande; 7 y 8 son contenido.

## 7. Qué necesito de ti

Decisiones:

1. **¿Aprobado el alcance y el caso (pedidos por email con revisión)?** Si prefieres otro caso del portfolio (por ejemplo, lectura de facturas), el resto del plan no cambia.
2. **Dónde vive el código:** `apps/agent` en este monorepo (mi propuesta: un solo sitio, CI ya montado) o un repositorio aparte. Esto afecta a si el código puede enlazarse públicamente. **¿Quieres que el repositorio sea público?** Si no, la página muestra arquitectura y capturas, pero no enlaza al código.
3. **Errores:** ¿empiezo con la opción B (sin cuenta) y dejo Sentry listo para cuando quieras crear la cuenta?
4. **Clave de Gemini para el agente:** una clave distinta a la de producción. Solo en tu entorno local o en los secretos de GitHub si quieres evaluaciones en vivo desde CI; por defecto, CI no llama al modelo.
5. **Tope de gasto:** ¿te vale 0,50 € diarios y unos 5 USD en total para el desarrollo?

Nada de esto lo creo yo: ni cuentas, ni claves, ni servicios.

## 8. Proyectos de ejemplo breves

Con el mismo criterio de honestidad: cada uno etiquetado «Proyecto de demostración» y descrito solo con lo que exista. Hay que **tener algo construido** antes de contarlo. Propongo tres, pequeños y de bajo coste, que **no escribiré hasta que existan y tú los apruebes**:

- **Cola de revisión con umbrales** (la parte de «02 / control» llevada a una mini-app con su repositorio), a partir de lo que ya está en la web.
- **Evaluaciones del asistente de esta web:** ya existen (`pnpm --filter @rr/api eval`, 37 casos); se pueden contar con sus cifras reales y el método.
- **Validador de cifras del asistente:** guardarraíl real en producción (`services/validator.ts`), explicado como decisión técnica.

Los cuatro proyectos que ya aparecen en la web (pedidos, encuestas, inventario, sensores) están marcados como «en desarrollo» en el contenido actual; **no los toco ni los amplío** sin que me confirmes qué es cierto de cada uno.

## 9. Riesgos y límites

- Con datos sintéticos, la precisión medida **no** predice la de un caso real. La página lo dirá.
- El agente puede equivocarse: por eso lo medido incluye los falsos positivos y por eso lo importante del diseño es la cola de revisión, no la autonomía.
- Si el tope de gasto se agota, la demo se para: es el comportamiento buscado.
