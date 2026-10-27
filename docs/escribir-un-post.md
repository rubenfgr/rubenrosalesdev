# Escribir un post

Un artículo = **una carpeta** con la fecha por delante y un fichero por idioma:

```
apps/web/src/content/blog/2026-10-27-automatizar-pedidos/
├── es.mdx
├── en.mdx
├── portada.webp        ← imágenes compartidas por los dos idiomas
└── flujo.png
```

- El nombre de la carpeta es `AAAA-MM-DD-<clave>`. El prefijo de fecha **debe coincidir con `date`** del frontmatter (si no, `pnpm i18n:check` y el build fallan). Así el explorador de archivos los ordena por fecha.
- La clave (la carpeta sin la fecha) empareja `es.mdx` y `en.mdx` y es el slug de la URL: `/blog/<clave>` (es) y `/en/blog/<clave>` (en). Si el slug inglés debe ser otro, ponlo en `urlSlug:` del `en.mdx`.
- No cambies la clave ni `urlSlug` una vez publicado: se rompen los enlaces. La fecha de la carpeta es la de publicación; si revisas el artículo después, usa `updated`, no renombres.
- Dentro de la carpeta no hay subcarpetas por año: con la fecha en el nombre basta.

## Flujo

1. `pnpm content:new blog <clave> [slug-en]` crea la carpeta de hoy con `es.mdx` y `en.mdx` (o créalos a mano con la plantilla de abajo).
2. Revisa en local con `pnpm dev` (los borradores se ven en desarrollo). `pnpm content:list` lista los artículos de más nuevo a más antiguo, con su estado.
3. Quita `draft: true` (o ponlo en `false`) en los dos ficheros, haz commit y `git push`. Si `main` es producción, pide aprobación antes.
4. El hosting construye y despliega. Si el frontmatter es inválido, el build falla y la web anterior sigue publicada.

## Plantilla

Copia esto en `es.mdx` (y la versión inglesa en `en.mdx`, de la misma carpeta):

````md
---
title: "Título claro y concreto"            # obligatorio, máximo 70 caracteres
description: "Una o dos frases que resuman el artículo para buscadores y redes."  # 50–160 caracteres
date: 2026-10-27                            # obligatorio; igual que el prefijo de la carpeta
updated: 2026-11-05                         # opcional, si lo revisas después
urlSlug: my-article                         # opcional; solo si el slug de este idioma no es la clave
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
- No se admiten campos que no estén en la plantilla (no uses `slug`: Astro lo toma como id de la entrada; para eso está `urlSlug`). El autor es fijo (Rubén Rosales).
- El tiempo de lectura se calcula solo.

## Imágenes

Guárdalas en la carpeta del artículo (p. ej. `portada.webp`, que usan los dos idiomas) y enlázalas con ruta relativa. Astro las optimiza. El texto alternativo es obligatorio:

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
