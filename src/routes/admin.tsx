import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminPage } from "~/client/pages/admin/admin.page";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AdminPage>
      <Outlet />
    </AdminPage>
  );
}
