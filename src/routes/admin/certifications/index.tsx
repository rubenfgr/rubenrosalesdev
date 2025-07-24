import { createFileRoute } from "@tanstack/react-router";
import CertificationsPage from "@/client/pages/admin/certifications/certification.page";

export const Route = createFileRoute("/admin/certifications/")({
  component: CertificationsPage,
});
