import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { serverTranslation } from "@/server/services/use-server-translation";
import { zodErrorResponse } from "@/server/utils/zodErrorResponse";
import { experienceService } from "~/server/modules/experiences/experience.service";
import { ExperienceCreateValidator } from "~/shared/validators";

export const ServerRoute = createServerFileRoute("/api/experiences/").methods({
  GET: async () => {
    try {
      const experiences = await experienceService.getAllExperiences();
      return json(experiences);
    } catch (e) {
      return zodErrorResponse(e);
    }
  },

  POST: async ({ request }) => {
    const { t } = serverTranslation();
    try {
      const body = await request.json();
      ExperienceCreateValidator.parse(body);
      const createdExperience = await experienceService.createExperience(body);
      return json({ data: createdExperience, message: t("experience_created") }, { status: 201 });
    } catch (e) {
      return zodErrorResponse(e);
    }
  },
});
