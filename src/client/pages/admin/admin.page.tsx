import { Link as RouterLink, useMatches } from "@tanstack/react-router";
import { c } from "node_modules/vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";
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
                  {(() => {
                    // Get filtered matches (excluding root and /admin)
                    const filtered = matches.filter(
                      (m) => m.pathname !== "/" && m.pathname !== "/admin",
                    );
                    if (filtered.length === 0) return null;
                    // For a path like /admin/certifications/b158763a-528e-41c2-b377-993d9c4a14f2
                    // filtered = [ { pathname: '/admin/certifications/b158763a-528e-41c2-b377-993d9c4a14f2', ... } ]
                    // We want: certifications > $id (or the actual id value)
                    const pathSegments = filtered[0].pathname.split("/").filter(Boolean); // ["admin", "certifications", "b158763a-528e-41c2-b377-993d9c4a14f2"]
                    // Remove 'admin' if present
                    const segments =
                      pathSegments[0] === "admin" ? pathSegments.slice(1) : pathSegments;
                    return segments.map((segment, idx) => {
                      const isLast = idx === segments.length - 1;
                      const label = t(`routes.${segment}.title`, { defaultValue: segment });
                      return (
                        <React.Fragment key={segment}>
                          {idx > 0 && <BreadcrumbSeparator />}
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <RouterLink
                                  to={
                                    `/admin/${
                                      segments
                                        .slice(0, idx + 1)
                                        .join("/")
                                      // biome-ignore lint/suspicious/noExplicitAny: any
                                    }` as any
                                  }
                                >
                                  {label}
                                </RouterLink>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      );
                    });
                  })()}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
