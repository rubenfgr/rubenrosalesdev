import { createFileRoute } from "@tanstack/react-router";
import CertificationFormPage from "~/client/pages/admin/certifications/certification-form.page";

export const Route = createFileRoute("/admin/certifications/$id")({
  component: CertificationFormPage,
});
