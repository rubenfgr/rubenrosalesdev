import type { ExperienceCreateDTO } from "../dto/experience.dto";

export function mapExperienceInputDTO(dto: ExperienceCreateDTO) {
  return {
    company: dto.company,
    position: dto.position,
    description: dto.description,
    startDate: dto.startDate,
    endDate: dto.endDate ?? null,
    userId: dto.userId,
  };
}

export function mapExperienceUpdateInputDTO(
  data: Partial<ExperienceCreateDTO>,
) {
  return {
    ...(data.company !== undefined && { company: data.company }),
    ...(data.position !== undefined && { position: data.position }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.startDate !== undefined && { startDate: data.startDate }),
    ...(data.endDate !== undefined && { endDate: data.endDate ?? null }),
    ...(data.userId !== undefined && { userId: data.userId }),
  };
}
