import { SidebarInset, SidebarProvider } from "@/client/components/ui";
import { AdminSidebarComponent } from "./components/admin-sidebar.component";

export const AdminPage = ({ children, ...props }: React.ComponentProps<typeof SidebarProvider>) => {
  return (
    <SidebarProvider {...props}>
      <div className="flex min-h-screen w-full">
        <AdminSidebarComponent />

        <SidebarInset className="flex-1 transition-all duration-300 ease-in-out">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
