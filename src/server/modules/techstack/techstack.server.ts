import { createServerFn } from "@tanstack/react-start";
import type { TechStackCreateDTO, TechStackIdDTO, TechStackUpdateDTO } from "@/shared/dto";
import { mapTechStackCreateDTO, mapTechStackUpdateDTO } from "@/shared/mappers";
import {
  TechStackCreateValidator,
  TechStackIdValidator,
  TechStackUpdateValidator,
} from "@/shared/validators";
import {
  createTechStack,
  deleteTechStack,
  getAllTechStack,
  getTechStackById,
  updateTechStack,
} from "./techstack.service";

export const listTechStack = createServerFn({ method: "GET" }).handler(async () => {
  return getAllTechStack();
});

export const getTechStack = createServerFn({ method: "GET" })
  .validator((input: TechStackIdDTO) => TechStackIdValidator.parse(input))
  .handler(async (ctx) => {
    return getTechStackById(ctx.data.id);
  });

export const createTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackCreateDTO) => TechStackCreateValidator.parse(input))
  .handler(async (ctx) => {
    const mapped = mapTechStackCreateDTO(ctx.data);
    return createTechStack(mapped);
  });

export const updateTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackUpdateDTO) => TechStackUpdateValidator.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapTechStackUpdateDTO(data);
    return updateTechStack(id, mapped);
  });

export const deleteTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackIdDTO) => TechStackIdValidator.parse(input))
  .handler(async (ctx) => {
    return deleteTechStack(ctx.data.id);
  });
