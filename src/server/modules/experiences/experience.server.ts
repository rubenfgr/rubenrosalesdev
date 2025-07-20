import { createServerFn } from "@tanstack/react-start";
import type { ExperienceCreateDTO, ExperienceIdDTO, ExperienceUpdateDTO } from "@/shared/dto";
import { mapExperienceCreateDTO, mapExperienceUpdateDTO } from "@/shared/mappers";
import {
  ExperienceCreateValidator,
  ExperienceIdValidator,
  ExperienceUpdateValidator,
} from "@/shared/validators";
import { experienceService } from "./experience.service";


export const listExperiences = createServerFn({ method: "GET" }).handler(async () => {
  return experienceService.getAllExperiences();
});

export const getExperience = createServerFn({ method: "GET" })
  .validator((input: ExperienceIdDTO) => ExperienceIdValidator.parse(input))
  .handler(async (ctx) => {
    return experienceService.getExperienceById(ctx.data.id);
  });

export const createExperienceServer = createServerFn({ method: "POST" })
  .validator((input: ExperienceCreateDTO) => ExperienceCreateValidator.parse(input))
  .handler(async (ctx) => {
    const mapped = mapExperienceCreateDTO(ctx.data);
    return experienceService.createExperience(mapped);
  });

export const updateExperienceServer = createServerFn({ method: "POST" })
  .validator((input: ExperienceUpdateDTO) => ExperienceUpdateValidator.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapExperienceUpdateDTO(data);
    return experienceService.updateExperience(id, mapped);
  });

export const deleteExperienceServer = createServerFn({ method: "POST" })
  .validator((input: ExperienceIdDTO) => ExperienceIdValidator.parse(input))
  .handler(async (ctx) => {
    return experienceService.deleteExperience(ctx.data.id);
  });
