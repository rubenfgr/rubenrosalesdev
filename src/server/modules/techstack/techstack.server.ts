import { createServerFn } from "@tanstack/react-start";
import type { TechStackCreateDTO, TechStackIdDTO, TechStackUpdateDTO } from "@/shared/dto";
import { mapTechStackCreateDTO, mapTechStackUpdateDTO } from "@/shared/mappers";
import {
  TechStackCreateValidator,
  TechStackIdValidator,
  TechStackUpdateValidator,
} from "@/shared/validators";
import { techStackService } from "./techstack.service";

export const listTechStack = createServerFn({ method: "GET" }).handler(async () => {
  return techStackService.getAllTechStack();
});

export const getTechStack = createServerFn({ method: "GET" })
  .validator((input: TechStackIdDTO) => TechStackIdValidator.parse(input))
  .handler(async (ctx) => {
    return techStackService.getTechStackById(ctx.data.id);
  });

export const createTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackCreateDTO) => TechStackCreateValidator.parse(input))
  .handler(async (ctx) => {
    const mapped = mapTechStackCreateDTO(ctx.data);
    return techStackService.createTechStack(mapped);
  });

export const updateTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackUpdateDTO) => TechStackUpdateValidator.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapTechStackUpdateDTO(data);
    return techStackService.updateTechStack(id, mapped);
  });

export const deleteTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackIdDTO) => TechStackIdValidator.parse(input))
  .handler(async (ctx) => {
    return techStackService.deleteTechStack(ctx.data.id);
  });
