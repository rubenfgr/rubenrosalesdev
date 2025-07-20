import { createServerFn } from "@tanstack/react-start";
import type { ProjectCreateDTO, ProjectIdDTO, ProjectUpdateDTO } from "@/shared/dto";
import { mapProjectCreateDTO, mapProjectUpdateDTO } from "@/shared/mappers";
import {
  ProjectCreateValidator,
  ProjectIdValidator,
  ProjectUpdateValidator,
} from "@/shared/validators";
import { projectService } from "./project.service";

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  return projectService.getAllProjects();
});

export const getProject = createServerFn({ method: "GET" })
  .validator((input: ProjectIdDTO) => ProjectIdValidator.parse(input))
  .handler(async (ctx) => {
    const { id } = ctx.data;
    return projectService.getProjectById(id);
  });

export const createProjectServer = createServerFn({ method: "POST" })
  .validator((input: ProjectCreateDTO) => ProjectCreateValidator.parse(input))
  .handler(async (ctx) => {
    const mapped = mapProjectCreateDTO(ctx.data);
    return projectService.createProject(mapped);
  });

export const updateProjectServer = createServerFn({ method: "POST" })
  .validator((input: ProjectUpdateDTO) => ProjectUpdateValidator.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapProjectUpdateDTO(data);
    return projectService.updateProject(id, mapped);
  });

export const deleteProjectServer = createServerFn({ method: "POST" })
  .validator((input: ProjectIdDTO) => ProjectIdValidator.parse(input))
  .handler(async (ctx) => {
    return projectService.deleteProject(ctx.data.id);
  });
