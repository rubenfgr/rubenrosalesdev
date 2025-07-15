---
description: 'Guidelines for building TanStack Start applications'
applyTo: '**/*.ts, **/*.tsx, **/*.js, **/*.jsx, **/*.css, **/*.scss, **/*.json'
---

# TanStack Start with Shadcn/ui Development Guide

You are an expert TypeScript developer specializing in TanStack Start applications with modern React patterns.

## Tech Stack
- TypeScript (strict mode)
- TanStack Start (routing & SSR)
- Shadcn/ui (UI components)
- Tailwind CSS (styling)
- Zod (validation)
- TanStack Query (client state)

## Code Style Rules

- NEVER use `any` type - always use proper TypeScript types
- Prefer function components over class components
- Always validate external data with Zod schemas
- Include error and pending boundaries for all routes
- Follow accessibility best practices with ARIA attributes

## Component Patterns

Use function components with proper TypeScript interfaces:

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(buttonVariants({ variant }))}>
      {children}
    </button>
  );
}
```

## Data Fetching

Use Route Loaders for:
- Initial page data required for rendering
- SSR requirements
- SEO-critical data

Use React Query for:
- Frequently updating data
- Optional/secondary data
- Client mutations with optimistic updates

```typescript
// Route Loader
export const Route = createFileRoute('/users')({
  loader: async () => {
    const users = await fetchUsers()
    return { users: userListSchema.parse(users) }
  },
  component: UserList,
})

// React Query
const { data: stats } = useQuery({
  queryKey: ['user-stats', userId],
  queryFn: () => fetchUserStats(userId),
  refetchInterval: 30000,
});
```

## Zod Validation

Always validate external data. Define schemas in `src/lib/schemas.ts`:

```typescript
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).default('user'),
})

export type User = z.infer<typeof userSchema>

// Safe parsing
const result = userSchema.safeParse(data)
if (!result.success) {
  console.error('Validation failed:', result.error.format())
  return null
}
```

## Routes

Structure routes in `src/routes/` with file-based routing. Always include error and pending boundaries:

```typescript
export const Route = createFileRoute('/users/$id')({
  loader: async ({ params }) => {
    const user = await fetchUser(params.id);
    return { user: userSchema.parse(user) };
  },
  component: UserDetail,
  errorBoundary: ({ error }) => (
    <div className="text-red-600 p-4">Error: {error.message}</div>
  ),
  pendingBoundary: () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
});
```

## UI Components

Always prefer Shadcn/ui components over custom ones:

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>User Details</CardTitle>
  </CardHeader>
  <CardContent>
    <Button onClick={handleSave}>Save</Button>
  </CardContent>
</Card>
```

Use Tailwind for styling with responsive design:

```typescript
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6">
  <Button className="w-full md:w-auto">Action</Button>
</div>
```

## Accessibility

Use semantic HTML first. Only add ARIA when no semantic equivalent exists:

```typescript
// ✅ Good: Semantic HTML with minimal ARIA
<button onClick={toggleMenu}>
  <MenuIcon aria-hidden="true" />
  <span className="sr-only">Toggle Menu</span>
</button>

// ✅ Good: ARIA only when needed (for dynamic states)
<button
  aria-expanded={isOpen}
  aria-controls="menu"
  onClick={toggleMenu}
>
  Menu
</button>

// ✅ Good: Semantic form elements
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />
{errors.email && (
  <p role="alert">{errors.email}</p>
)}
```

## File Organization

```
src/
├── components/ui/    # Shadcn/ui components
├── lib/schemas.ts    # Zod schemas
├── routes/          # File-based routes
└── routes/api/      # Server routes (.ts)
```

## Import Standards

Use `@/` alias for all internal imports:

```typescript
// ✅ Good
import { Button } from '@/components/ui/button'
import { userSchema } from '@/lib/schemas'

// ❌ Bad
import { Button } from '../components/ui/button'
```

## Adding Components

Install Shadcn components when needed:

```bash
npx shadcn@latest add button card input dialog
```


## Principios de Arquitectura

- Mantén la lógica de negocio separada de la UI.
- Usa hooks personalizados para lógica reutilizable.
- Prefiere composición de componentes sobre herencia.
- Los datos y la UI deben estar desacoplados: los componentes reciben datos validados y tipados.

## TypeScript

- Usa `strict: true` en `tsconfig.json`.
- Declara todos los props y estados con tipos explícitos.
- Prefiere `z.infer<typeof schema>` para tipar datos validados.
- No uses `any` ni `as` innecesario.

## Validación y Errores

- Valida toda entrada/salida externa con Zod.
- Los endpoints de API deben devolver errores claros y tipados.
- Usa boundaries (`errorBoundary`, `pendingBoundary`) en todas las rutas.
- Muestra mensajes de error accesibles y amigables.

## Accesibilidad (refuerzo)

- Usa HTML semántico siempre que sea posible.
- Añade `aria-*` solo cuando sea necesario.
- Usa `role="alert"` para mensajes de error.
- Asegúrate de que todos los inputs tengan `label` asociado.
- Testea con herramientas como Lighthouse o axe.

## Ejemplo de Hook Personalizado

```typescript
// src/hooks/useIsMobile.ts
import { useMediaQuery } from '@tanstack/react-query'

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}
```

## Organización de Archivos (detallada)

- `src/components/ui/`: Solo componentes Shadcn/ui.
- `src/components/common/`: Componentes propios reutilizables.
- `src/hooks/`: Hooks personalizados.
- `src/lib/`: Utilidades, helpers y validaciones.
- `src/routes/`: Rutas file-based.
- `src/types/`: Tipos globales y compartidos.


## Linter y Formateador: Biome

- Usa [Biome](https://biomejs.dev/) como linter y formateador para todo el código TypeScript, JavaScript, JSON, CSS y Markdown.
- Configura Biome en la raíz del proyecto con un archivo `biome.json`.
- Integra Biome con tu editor (VS Code: instala la extensión oficial).
- Usa los siguientes comandos recomendados:
  - `npx biome check .` para linting
  - `npx biome format .` para formatear todo el proyecto
- Añade scripts en `package.json`:

```json
{
  "scripts": {
    "lint": "biome check .",
    "format": "biome format ."
  }
}
```

- Biome debe ejecutarse en CI antes de cada deploy.
- No aceptes PRs que no pasen el linting y formateo de Biome.

Ejemplo de configuración mínima (`biome.json`):

```json
{
  "extends": [],
  "linter": { "rules": { "recommended": true } },
  "formatter": { "enabled": true }
}
```

---

- Always validate external data with Zod
- Use route loaders for initial data, React Query for updates
- Include error/pending boundaries on all routes
- Prefer Shadcn components over custom UI
- Use `@/` imports consistently
- Follow accessibility best practices
