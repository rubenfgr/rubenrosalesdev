---
title: "App de Inventario con Código de Barras"
summary: "Aplicación móvil multiplataforma para gestión de inventario con escaneo de código de barras, almacenamiento local SQLite y sincronización automática con el backend cuando vuelve la conexión."
category: movil
context: profesional
stack: ["React Native","TypeScript","SQLite","REST API"]
result: "Cero interrupciones en la operativa de almacén por fallos de red, con una reducción significativa de errores de captura frente al registro manual."
resultVerified: false
featured: false
order: 4
published: false
---

## Problema

El trabajo en movilidad exigía una herramienta capaz de registrar inventario con rapidez incluso en contextos de conectividad irregular.

- Necesidad de operar desde móvil en entornos reales de almacén o campo.
- Dependencia de escaneo rápido para reducir errores de captura.
- Riesgo de bloqueo si la conectividad fallaba.

## Solución

Se construyó una app multiplataforma orientada a velocidad de uso, captura fiable y sincronización transparente con el backend.

- Escaneo de códigos de barras desde dispositivo móvil.
- Modelo offline-first con almacenamiento local.
- Sincronización automática cuando vuelve la conectividad.

## Arquitectura

La arquitectura prioriza continuidad operativa y una integración sencilla con servicios centrales.

- React Native con TypeScript para una única base de producto móvil.
- SQLite para persistencia local y trabajo sin conexión.
- REST API para sincronización y consolidación de datos.

## Resultado

La operativa de inventario gana velocidad, reduce errores de captura y no se detiene por problemas de red puntuales.

- Trabajo fluido en movilidad.
- Menor fricción en tareas de inventario.
- Sincronización consistente con los sistemas centrales.
