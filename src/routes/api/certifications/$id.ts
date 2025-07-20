import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { certificationService } from "~/server/modules/certifications/certification.service";
import { CertificationIdValidator, CertificationUpdateValidator } from "~/shared/validators";

export const ServerRoute = createServerFileRoute("/api/certifications/$id").methods({
  PUT: async ({ request, params }) => {
    try {
      const body = await request.json();
      console.log("Updating certification with body:", body);
      const { id } = params as { id: string };
      CertificationUpdateValidator.parse({
        id,
        data: body,
      });
      const updatedCertification = await certificationService.updateCertification(id, body);
      return json({ data: updatedCertification, message: 'Certification updated successfully' }, { status: 200 });
    } catch (e) {
      console.error(e);
      return json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
    }
  },

  DELETE: async ({ params }) => {
    try {
      const { id } = params as { id: string };
      CertificationIdValidator.parse({ id });
      await certificationService.deleteCertification(id);
      return json({ message: "Certification deleted successfully" }, { status: 200 });
    } catch (e) {
      console.error(e);
      return json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
    }
  },
});
