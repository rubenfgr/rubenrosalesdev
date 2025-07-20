import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { certificationService } from "@/server/modules/certifications/certification.service";
import { mapCertificationCreateDTO } from "@/shared/mappers";
import {
    CertificationCreateValidator,
    CertificationIdValidator,
} from "@/shared/validators";

export const ServerRoute = createServerFileRoute("/api/certifications").methods({
    GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        try {
            if (id) {
                CertificationIdValidator.parse({ id });
                const certification = await certificationService.getCertificationById(id);
                if (!certification) return json({ error: "Not found" }, { status: 404 });
                return json(certification);
            }
            const certifications = await certificationService.getAllCertifications();
            return json(certifications);
        } catch (e) {
            return json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
        }
    },

    POST: async ({ request }) => {
        try {
            const body = await request.json();
            CertificationCreateValidator.parse(body);
            const mapped = mapCertificationCreateDTO(body);
            const created = await certificationService.createCertification(mapped);
            return json(created, { status: 201 });
        } catch (e) {
            console.error(e);
            return json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
        }
    },
});
