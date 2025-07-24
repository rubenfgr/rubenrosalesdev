import { createFileRoute } from "@tanstack/react-router";
import CertificationDetailPage from "@/client/pages/admin/certifications/certification-detail.page";

export const Route = createFileRoute("/admin/certifications/$id")({
  component: CertificationDetailPage,
});
