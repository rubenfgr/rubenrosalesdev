---
title: "Plataforma de Análisis de Noticias con IA"
summary: "Recopilación automática de noticias desde múltiples fuentes, procesamiento con IA y extracción de información relevante para facilitar el seguimiento y análisis por parte del cliente."
category: web
context: profesional
stack: ["Scraping","IA Generativa","Node.js","TypeScript","APIs"]
result: "Menor tiempo de curación de medios y detección más rápida de noticias accionables para el cliente."
resultVerified: false
featured: false
order: 9
published: false
---

## Problema

El seguimiento manual de múltiples medios implicaba revisar fuentes dispersas, filtrar ruido y sintetizar información de forma poco escalable.

- Demasiadas fuentes para revisar manualmente.
- Duplicidades y baja señal entre grandes volúmenes de contenido.
- Tiempo invertido en leer antes de llegar a lo relevante.

## Solución

Se creó una plataforma que recopila contenido de distintas fuentes, lo procesa automáticamente y destaca la información relevante para el contexto del cliente.

- Captura automatizada y normalización de noticias.
- Procesamiento con IA para resumir, clasificar y extraer entidades.
- Presentación orientada a seguimiento operativo y análisis.

## Arquitectura

La solución combina captura, procesamiento y presentación en capas desacopladas para poder ajustar fuentes y criterios sin rehacer el sistema.

- Servicios Node.js/TypeScript para scraping y procesamiento.
- APIs para exponer resúmenes y señales relevantes.
- Módulos de IA para extracción, priorización y síntesis.

## Resultado

El cliente accede antes a la información que importa y reduce el esfuerzo dedicado a buscar, filtrar y resumir contenido de forma manual.

- Menos trabajo repetitivo de curación.
- Más rapidez para detectar noticias accionables.
- Mejor contexto para toma de decisiones o seguimiento.
