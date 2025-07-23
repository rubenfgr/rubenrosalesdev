import { Box } from "lucide-react";
import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { adminSidebarMenu } from "./admin-sidebar-menu.model";
import { AdminSidebarNavMainComponent } from "./components/admin-sidebar-nav-main.component";
import { AdminSidebarNavSecondaryComponent } from "./components/admin-sidebar-nav-secondary.component";
import { AdminSidebarNavUserComponent } from "./components/admin-sidebar-nav-user.component";

export function AdminSidebarComponent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar
      {...props}
      className={`relative transition-all duration-300 ease-in-out ${open ? "w-64" : "w-0"}`}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/admin">
                <Box className="!size-5" />
                <span className="font-semibold text-base">Ruben Rosales Dev</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminSidebarNavMainComponent items={adminSidebarMenu.navMain} />
        <AdminSidebarNavSecondaryComponent
          items={adminSidebarMenu.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <AdminSidebarNavUserComponent user={adminSidebarMenu.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
