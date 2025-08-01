import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/help")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/help"!</div>;
}
