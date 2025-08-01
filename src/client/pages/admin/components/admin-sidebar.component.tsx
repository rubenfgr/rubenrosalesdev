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
import { ScrollArea, Separator } from "~/client/components/ui";
import { cn } from "~/client/utils";
import { adminSidebarMenu } from "./admin-sidebar-menu.model";
import { AdminSidebarNavMainComponent } from "./components/admin-sidebar-nav-main.component";
import { AdminSidebarNavSecondaryComponent } from "./components/admin-sidebar-nav-secondary.component";
import { AdminSidebarNavUserComponent } from "./components/admin-sidebar-nav-user.component";

export function AdminSidebarComponent({
  open,
  setOpen,
  ...props
}: React.ComponentProps<typeof Sidebar> & { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Sidebar
      {...props}
      className={`transition-all duration-300 ease-in-out ${open ? "w-64" : "w-0"}`}
    >
      <div className="flex h-screen flex-col border-sidebar-border border-r bg-sidebar text-sidebar-foreground">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <a href="/admin">
                  <Box className="!size-5" />
                  <span className="font-semibold text-base text-sidebar-foreground">
                    Ruben Rosales Dev
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="overflow-y-hidden">
          <ScrollArea className="h-full">
            <AdminSidebarNavMainComponent items={adminSidebarMenu.navMain} />
            <Separator />
            <AdminSidebarNavSecondaryComponent
              items={adminSidebarMenu.navSecondary}
              className="mt-auto"
            />
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter>
          <AdminSidebarNavUserComponent user={adminSidebarMenu.user} />
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
