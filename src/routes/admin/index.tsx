import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui";
import { useClientTranslation } from "@/client/hooks";
import CertificationsPage from "@/client/pages/admin/certifications/certification.page";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { t } = useClientTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.dashboard.title")}</CardTitle>
          <p className="text-gray-600 text-sm">{t("admin.dashboard.description")}</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="certifications">
            <TabsList>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
              <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            <TabsContent value="certifications">
              <CertificationsPage />
            </TabsContent>
            <TabsContent value="projects">
              <div>Manage projects</div>
            </TabsContent>
            <TabsContent value="experience">
              <div>Manage experience</div>
            </TabsContent>
            <TabsContent value="blog">
              <div>Manage blog posts</div>
            </TabsContent>
            <TabsContent value="techstack">
              <div>Manage tech stack</div>
            </TabsContent>
            <TabsContent value="profile">
              <div>Manage profile</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
