# Escribir un post

Un artículo = un fichero por idioma: `src/content/blog/es/<slug>.mdx` y `src/content/blog/en/<slug>.mdx`. El slug es el nombre del fichero y forma la URL: `/blog/<slug>` (es) y `/en/blog/<slug>` (en). Los dos ficheros se emparejan con el mismo `translationKey`; los slugs pueden ser distintos.

## Flujo

1. Crea los dos ficheros con la plantilla de abajo (o usa `pnpm content:new blog <slug>` cuando exista).
2. Revisa en local con `pnpm dev` (los borradores se ven en desarrollo).
3. Quita `draft: true` (o ponlo en `false`), haz commit y `git push` a `main`.
4. El hosting construye y despliega. Si el frontmatter es inválido, el build falla y la web anterior sigue publicada.

## Plantilla

Copia esto en `src/content/blog/es/mi-articulo.mdx` (y la versión inglesa en `src/content/blog/en/`):

````md
---
title: "Título claro y concreto"            # obligatorio, máximo 70 caracteres
description: "Una o dos frases que resuman el artículo para buscadores y redes."  # 50–160 caracteres
date: 2026-10-22                            # obligatorio
translationKey: mi-articulo                 # obligatorio, igual en es y en
updated: 2026-11-05                         # opcional, si lo revisas después
tags: [automatizacion, procesos]            # de 1 a 4, en minúsculas y kebab-case
draft: true                                 # true = no se publica en producción
cover: ./portada.webp                       # opcional
coverAlt: "Descripción de la imagen"        # obligatorio si hay cover
---

Introducción del artículo.

## Primer apartado

Texto del apartado.

### Un subapartado

Más texto.
````

Reglas del frontmatter (si no se cumplen, el build falla):

- `title` ≤ 70 caracteres y `description` entre 50 y 160.
- `tags`: de 1 a 4, solo minúsculas, números y guiones (`ia-aplicada`, no `IA aplicada`).
- Si hay `cover`, `coverAlt` es obligatorio.
- No se admiten campos que no estén en la plantilla. El autor es fijo (Rubén Rosales).
- El tiempo de lectura se calcula solo.

## Imágenes

Guárdalas junto al artículo (p. ej. `src/content/blog/es/portada.webp`) y enlázalas con ruta relativa. Astro las optimiza. El texto alternativo es obligatorio:

```md
![Diagrama del flujo de pedidos](./flujo.png)
```

## Admoniciones

Sintaxis como en Docusaurus. Tipos: `note`, `tip`, `warning` y `danger`. Con título propio entre corchetes:

```md
:::note
Información de contexto.
:::

:::tip[Un consejo]
Algo que ahorra tiempo.
:::

:::warning
Algo que conviene tener en cuenta.
:::

:::danger
Una acción que no se puede deshacer.
:::
```

## Bloques de código

Se indica el lenguaje, y opcionalmente un título de archivo y las líneas a resaltar. Cada bloque lleva botón de copiar:

````md
```ts title="ejemplo.ts" {2,4-5}
export function suma(a: number, b: number): number {
  const resultado = a + b;
  return resultado;
}
```
````

## Encabezados e índice

Usa `##` y `###`: el índice «En este artículo» los recoge solos. Cada encabezado tiene un enlace ancla. No uses `#` (el título ya es el `h1`).

## Etiquetas

Reutiliza las existentes cuando puedas: están todas en `/blog/etiquetas`.

## Borradores

Con `draft: true` el artículo no se publica en producción, no entra en el RSS ni en el sitemap. No lo enlaces desde contenido publicado: el build de producción lo detecta y falla.
