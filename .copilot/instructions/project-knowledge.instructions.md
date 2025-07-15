---
description: 'Project-specific knowledge and conventions for the Ruben Rosales professional portfolio'
applyTo: '**/*.ts, **/*.tsx, **/*.js, **/*.jsx, **/*.md'
---

# Ruben Rosales Portfolio – Project Knowledge

## Propósito

Portfolio profesional para Ruben Rosales, desarrollador full stack web con experiencia en Angular, React, NestJS y otras tecnologías modernas. El objetivo es mostrar proyectos, experiencia, stack tecnológico, blog y formas de contacto de manera profesional, accesible y optimizada para SEO.

## Modelo de Datos (borrador)

- **Profile**: Información personal, skills, experiencia laboral, educación, certificaciones y tecnologías dominadas.
- **Project**: Proyectos destacados, con nombre, descripción, tecnologías usadas, enlaces (demo, repo), imágenes, fechas y rol.
- **Experience**: Historial laboral, empresa, cargo, periodo, responsabilidades, tecnologías y logros.
- **BlogPost**: Artículos técnicos, con título, resumen, contenido, fecha, etiquetas y estado de publicación.
- **Contact**: Formulario de contacto validado y seguro.
- **TechStack**: Listado de tecnologías, frameworks y herramientas con nivel de dominio y años de experiencia.
- **Certification**: Certificaciones relevantes, institución, fecha y descripción.

## Convenciones

- Todos los datos externos deben validarse con Zod.
- Los esquemas de datos se definen en `src/lib/schemas.ts`.
- Los endpoints de API deben devolver datos validados y tipados.
- Los componentes de UI deben ser reutilizables y basados en Shadcn/ui.
- Usar rutas file-based en `src/routes/` para navegación y SSR.
- Importaciones internas siempre con el alias `@/`.

## Buenas Prácticas

- No usar el tipo `any` nunca.
- Siempre manejar estados de error y carga en rutas y componentes.
- Seguir las mejores prácticas de accesibilidad (HTML semántico, ARIA solo cuando sea necesario).
- Mantener el código limpio, modular y documentado.
- Priorizar el rendimiento y la experiencia de usuario.

## Estructura de Carpetas

```
src/
├── components/ui/    # Componentes Shadcn/ui
├── lib/schemas.ts    # Esquemas Zod
├── routes/           # Rutas file-based
├── routes/api/       # Endpoints API
├── types/            # Tipos globales
```

## Ejemplo de Modelo de Datos

```typescript
// src/lib/schemas.ts
import { z } from 'zod'

export const techStackSchema = z.object({
  name: z.string(),
  category: z.string(),
  experienceYears: z.number().int().min(0),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
})

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  technologies: z.array(techStackSchema),
  links: z.object({
    demo: z.string().url().optional(),
    repo: z.string().url().optional(),
  }),
  images: z.array(z.string().url()).optional(),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  role: z.string(),
})

export const experienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  responsibilities: z.array(z.string()),
  technologies: z.array(techStackSchema),
  achievements: z.array(z.string()).optional(),
})

export const blogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  publishedAt: z.string().datetime(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published']),
})

export const certificationSchema = z.object({
  name: z.string(),
  institution: z.string(),
  date: z.string().date(),
  description: z.string().optional(),
})

export const profileSchema = z.object({
  name: z.string(),
  title: z.string(),
  summary: z.string(),
  skills: z.array(techStackSchema),
  experience: z.array(experienceSchema),
  certifications: z.array(certificationSchema),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    startDate: z.string().date(),
    endDate: z.string().date().optional(),
  })),
  contactEmail: z.string().email(),
  socialLinks: z.record(z.string(), z.string().url()),
})
```

## Notas

- El portfolio debe ser fácil de mantener y escalar.
- El contenido debe ser fácil de actualizar y agregar.
- El diseño debe ser responsivo y profesional.

---
