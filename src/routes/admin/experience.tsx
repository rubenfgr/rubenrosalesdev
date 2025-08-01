import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/experience")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/experience"!</div>;
}
