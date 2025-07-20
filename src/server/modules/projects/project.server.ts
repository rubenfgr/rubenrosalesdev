import { createServerFn } from "@tanstack/react-start";
import {
  ProjectId,
  type ProjectIdDTO,
  ProjectInput,
  type ProjectInputDTO,
  ProjectUpdateInput,
  type ProjectUpdateInputDTO,
} from "@/shared/dto";
import { mapProjectInputDTO, mapProjectUpdateInputDTO } from "@/shared/mappers";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from "./project.service";

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  return getAllProjects();
});

export const getProject = createServerFn({ method: "GET" })
  .validator((input: ProjectIdDTO) => ProjectId.parse(input))
  .handler(async (ctx) => {
    const { id } = ctx.data;
    return getProjectById(id);
  });

export const createProjectServer = createServerFn({ method: "POST" })
  .validator((input: ProjectInputDTO) => ProjectInput.parse(input))
  .handler(async (ctx) => {
    const mapped = mapProjectInputDTO(ctx.data);
    return createProject(mapped);
  });

export const updateProjectServer = createServerFn({ method: "POST" })
  .validator((input: ProjectUpdateInputDTO) => ProjectUpdateInput.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapProjectUpdateInputDTO(data);
    return updateProject(id, mapped);
  });

export const deleteProjectServer = createServerFn({ method: "POST" })
  .validator((input: ProjectIdDTO) => ProjectId.parse(input))
  .handler(async (ctx) => {
    const { id } = ctx.data;
    return deleteProject(id);
  });
