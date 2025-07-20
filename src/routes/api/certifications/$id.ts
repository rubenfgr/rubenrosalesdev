import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { serverTranslation } from "@/server/services/use-server-translation";
import { zodErrorResponse } from "@/server/utils/zodErrorResponse";
import { certificationService } from "~/server/modules/certifications/certification.service";
import { CertificationIdValidator, CertificationUpdateValidator } from "~/shared/validators";

export const ServerRoute = createServerFileRoute("/api/certifications/$id").methods({
  GET: async ({ params }) => {
    const { t } = serverTranslation();
    try {
      const { id } = params as { id: string };
      CertificationIdValidator.parse({ id });
      const certification = await certificationService.getCertificationById(id);
      if (!certification) return json({ error: t("not_found") }, { status: 404 });
      return json(certification);
    } catch (e) {
      return zodErrorResponse(e);
    }
  },

  PUT: async ({ request, params }) => {
    const { t } = serverTranslation();
    try {
      const body = await request.json();
      const { id } = params as { id: string };
      CertificationUpdateValidator.parse({
        id,
        data: body,
      });
      const updatedCertification = await certificationService.updateCertification(id, body);
      return json(
        { data: updatedCertification, message: t("certification_updated") },
        { status: 200 },
      );
    } catch (e) {
      return zodErrorResponse(e);
    }
  },

  DELETE: async ({ params }) => {
    const { t } = serverTranslation();
    try {
      const { id } = params as { id: string };
      CertificationIdValidator.parse({ id });
      await certificationService.deleteCertification(id);
      return json({ message: t("certification_deleted") }, { status: 200 });
    } catch (e) {
      return zodErrorResponse(e);
    }
  },
});
