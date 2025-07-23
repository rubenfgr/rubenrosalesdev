import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/techstack')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/techstack"!</div>
}
