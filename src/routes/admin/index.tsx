import { createFileRoute } from "@tanstack/react-router";
import { PanelTop } from "lucide-react";
import {
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/client/components/ui";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboardContent() {
  const { open } = useSidebar();
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        className={`relative bg-red-200 transition-all duration-300 ease-in-out ${
          open ? "w-64" : "w-0"
        }`}
      >
        <SidebarHeader>TEST</SidebarHeader>
        <SidebarContent>{/* We create a SidebarGroup for each parent. */}</SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex-1 bg-yellow-200 transition-all duration-300 ease-in-out">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </div>
  );
}

function AdminDashboard() {
  return (
    <SidebarProvider>
      <AdminDashboardContent />
    </SidebarProvider>
  );
}

// const { t } = useClientTranslation();

// return (
//   <div className="min-h-screen bg-gray-50 p-8">
//     <Card>
//       <CardHeader>
//         <CardTitle>{t("admin.dashboard.title")}</CardTitle>
//         <p className="text-gray-600 text-sm">{t("admin.dashboard.description")}</p>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="certifications">
//           <TabsList>
//             <TabsTrigger value="certifications">Certifications</TabsTrigger>
//             <TabsTrigger value="projects">Projects</TabsTrigger>
//             <TabsTrigger value="experience">Experience</TabsTrigger>
//             <TabsTrigger value="blog">Blog Posts</TabsTrigger>
//             <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
//             <TabsTrigger value="profile">Profile</TabsTrigger>
//           </TabsList>
//           <TabsContent value="certifications">
//             <CertificationsPage />
//           </TabsContent>
//           <TabsContent value="projects">
//             <div>Manage projects</div>
//           </TabsContent>
//           <TabsContent value="experience">
//             <div>Manage experience</div>
//           </TabsContent>
//           <TabsContent value="blog">
//             <div>Manage blog posts</div>
//           </TabsContent>
//           <TabsContent value="techstack">
//             <div>Manage tech stack</div>
//           </TabsContent>
//           <TabsContent value="profile">
//             <div>Manage profile</div>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   </div>
// );
