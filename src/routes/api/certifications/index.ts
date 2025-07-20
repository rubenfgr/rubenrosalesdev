import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { certificationService } from "@/server/modules/certifications/certification.service";
import { serverTranslation } from "@/server/services/use-server-translation";
import { zodErrorResponse } from "@/server/utils/zodErrorResponse";
import { CertificationCreateValidator } from "~/shared/validators";

export const ServerRoute = createServerFileRoute("/api/certifications/").methods({
  GET: async () => {
    try {
      const certifications = await certificationService.getAllCertifications();
      return json(certifications);
    } catch (e) {
      return zodErrorResponse(e);
    }
  },

  POST: async ({ request }) => {
    const { t } = serverTranslation();
    try {
      const body = await request.json();
      CertificationCreateValidator.parse(body);
      const createdCertification = await certificationService.createCertification(body);
      return json(
        { data: createdCertification, message: t("certification_created") },
        { status: 201 },
      );
    } catch (e) {
      return zodErrorResponse(e);
    }
  },
});
