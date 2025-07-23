import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/user/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/user/notifications"!</div>;
}
