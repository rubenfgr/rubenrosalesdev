import { createServerFn } from "@tanstack/react-start";
import {
  TechStackId,
  type TechStackIdDTO,
  TechStackInput,
  type TechStackInputDTO,
  TechStackUpdateInput,
  type TechStackUpdateInputDTO,
} from "@/shared/dto";
import {
  mapTechStackInputDTO,
  mapTechStackUpdateInputDTO,
} from "@/shared/mappers";
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
  .validator((input: TechStackIdDTO) => TechStackId.parse(input))
  .handler(async (ctx) => {
    return getTechStackById(ctx.data.id);
  });

export const createTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackInputDTO) => TechStackInput.parse(input))
  .handler(async (ctx) => {
    const mapped = mapTechStackInputDTO(ctx.data);
    return createTechStack(mapped);
  });

export const updateTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackUpdateInputDTO) => TechStackUpdateInput.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapTechStackUpdateInputDTO(data);
    return updateTechStack(id, mapped);
  });

export const deleteTechStackServer = createServerFn({ method: "POST" })
  .validator((input: TechStackIdDTO) => TechStackId.parse(input))
  .handler(async (ctx) => {
    return deleteTechStack(ctx.data.id);
  });
