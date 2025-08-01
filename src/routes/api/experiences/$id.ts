import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { serverTranslation } from "@/server/services/use-server-translation";
import { zodErrorResponse } from "@/server/utils/zodErrorResponse";
import { experienceService } from "~/server/modules/experiences/experience.service";
import { ExperienceIdValidator, ExperienceUpdateValidator } from "~/shared/validators";

export const ServerRoute = createServerFileRoute("/api/experiences/$id").methods({
  GET: async ({ params }) => {
    const { t } = serverTranslation();
    try {
      const { id } = params as { id: string };
      ExperienceIdValidator.parse({ id });
      const experience = await experienceService.getExperienceById(id);
      if (!experience) return json({ error: t("not_found") }, { status: 404 });
      return json(experience);
    } catch (e) {
      return zodErrorResponse(e);
    }
  },

  PUT: async ({ request, params }) => {
    const { t } = serverTranslation();
    try {
      const body = await request.json();
      const { id } = params as { id: string };
      ExperienceUpdateValidator.parse({ id, data: body });
      const updatedExperience = await experienceService.updateExperience(id, body);
      return json({ data: updatedExperience, message: t("experience_updated") }, { status: 200 });
    } catch (e) {
      return zodErrorResponse(e);
    }
  },

  DELETE: async ({ params }) => {
    const { t } = serverTranslation();
    try {
      const { id } = params as { id: string };
      ExperienceIdValidator.parse({ id });
      await experienceService.deleteExperience(id);
      return json({ message: t("experience_deleted") }, { status: 200 });
    } catch (e) {
      return zodErrorResponse(e);
    }
  },
});
