import { createServerFn } from '@tanstack/react-start';
import { getAllExperiences, getExperienceById, createExperience, updateExperience, deleteExperience } from '../services/experience.service';
import {
  ExperienceInput,
  ExperienceInputDTO,
  ExperienceUpdateInput,
  ExperienceUpdateInputDTO,
  ExperienceId,
  ExperienceIdDTO,
} from '../models/experience.model';
import {
  mapExperienceInputDTO,
  mapExperienceUpdateInputDTO,
} from '../mappers/experience.mapper';

export const listExperiences = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getAllExperiences();
  });

export const getExperience = createServerFn({ method: 'GET' })
  .validator((input: ExperienceIdDTO) => ExperienceId.parse(input))
  .handler(async (ctx) => {
    return getExperienceById(ctx.data.id);
  });

export const createExperienceServer = createServerFn({ method: 'POST' })
  .validator((input: ExperienceInputDTO) => ExperienceInput.parse(input))
  .handler(async (ctx) => {
    const mapped = mapExperienceInputDTO(ctx.data);
    return createExperience(mapped);
  });

export const updateExperienceServer = createServerFn({ method: 'POST' })
  .validator((input: ExperienceUpdateInputDTO) => ExperienceUpdateInput.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapExperienceUpdateInputDTO(data);
    return updateExperience(id, mapped);
  });

export const deleteExperienceServer = createServerFn({ method: 'POST' })
  .validator((input: ExperienceIdDTO) => ExperienceId.parse(input))
  .handler(async (ctx) => {
    return deleteExperience(ctx.data.id);
  });
