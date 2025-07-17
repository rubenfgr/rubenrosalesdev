import { ProjectInputDTO } from '../models/project.model';

export function mapProjectInputDTO(dto: ProjectInputDTO) {
  return {
    title: dto.title,
    description: dto.description,
    url: dto.url ?? null,
    imageUrl: dto.imageUrl ?? null,
    startDate: dto.startDate,
    endDate: dto.endDate ?? null,
    userId: dto.userId,
  };
}

export function mapProjectUpdateInputDTO(data: Partial<ProjectInputDTO>) {
  return {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.url !== undefined && { url: data.url ?? null }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl ?? null }),
    ...(data.startDate !== undefined && { startDate: data.startDate }),
    ...(data.endDate !== undefined && { endDate: data.endDate ?? null }),
    ...(data.userId !== undefined && { userId: data.userId }),
  };
}
