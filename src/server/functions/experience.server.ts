import { createServerFn } from "@tanstack/react-start";
import {
  type ExperienceCreateDTO,
  ExperienceId,
  type ExperienceIdDTO,
  ExperienceInput,
  type ExperienceUpdateDTO,
  ExperienceUpdateInput,
} from "../../shared/dto/experience.dto";
import {
  mapExperienceInputDTO,
  mapExperienceUpdateInputDTO,
} from "../../shared/mappers/experience.mapper";
import {
  createExperience,
  deleteExperience,
  getAllExperiences,
  getExperienceById,
  updateExperience,
} from "../services/experience.service";

export const listExperiences = createServerFn({ method: "GET" }).handler(
  async () => {
    return getAllExperiences();
  },
);

export const getExperience = createServerFn({ method: "GET" })
  .validator((input: ExperienceIdDTO) => ExperienceId.parse(input))
  .handler(async (ctx) => {
    return getExperienceById(ctx.data.id);
  });

export const createExperienceServer = createServerFn({ method: "POST" })
  .validator((input: ExperienceCreateDTO) => ExperienceInput.parse(input))
  .handler(async (ctx) => {
    const mapped = mapExperienceInputDTO(ctx.data);
    return createExperience(mapped);
  });

export const updateExperienceServer = createServerFn({ method: "POST" })
  .validator((input: ExperienceUpdateDTO) => ExperienceUpdateInput.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapExperienceUpdateInputDTO(data);
    return updateExperience(id, mapped);
  });

export const deleteExperienceServer = createServerFn({ method: "POST" })
  .validator((input: ExperienceIdDTO) => ExperienceId.parse(input))
  .handler(async (ctx) => {
    return deleteExperience(ctx.data.id);
  });
