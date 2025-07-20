import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { certificationService } from "@/server/modules/certifications/certification.service";
import { CertificationCreateValidator } from "~/shared/validators";

export const ServerRoute = createServerFileRoute("/api/certifications/").methods({
  GET: async () => {
    try {
      const certifications = await certificationService.getAllCertifications();
      return json(certifications);
    } catch (e) {
      console.error(e);
      return json({ error: "User not found" }, { status: 404 });
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json();
      CertificationCreateValidator.parse(body);
      const createdCertification = await certificationService.createCertification(body);
      return json(createdCertification, { status: 201 });
    } catch (e) {
      console.error(e);
      return json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
    }
  },
});
