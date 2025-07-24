import { Link as RouterLink, useMatches } from "@tanstack/react-router";
import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/client/components/ui";
import { useClientTranslation } from "~/client/hooks";
import { AdminSidebarComponent } from "./components/admin-sidebar.component";

export const AdminPage = ({ children, ...props }: React.ComponentProps<typeof SidebarProvider>) => {
  const matches = useMatches();
  const { t } = useClientTranslation();

  return (
    <SidebarProvider {...props}>
      <div className="flex min-h-screen w-full">
        <AdminSidebarComponent />

        <SidebarInset className="flex-1 transition-all duration-300 ease-in-out">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {matches
                    .filter((m) => m.pathname !== "/" && m.pathname !== "/admin")
                    .map((match, idx, arr) => {
                      const isLast = idx === arr.length - 1;
                      const name = t(`routes.${match.pathname.split("/").pop()}.title`, {
                        defaultValue: match.pathname.split("/").pop(),
                      });

                      return (
                        <React.Fragment key={match.pathname}>
                          {idx > 0 && <BreadcrumbSeparator />}
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{name}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <RouterLink to={match.pathname}>{name}</RouterLink>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      );
                    })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
