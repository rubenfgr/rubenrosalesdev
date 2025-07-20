import type { TechStackInputDTO } from "../dto/techstack.dto";

export function mapTechStackInputDTO(dto: TechStackInputDTO) {
  return {
    name: dto.name,
    level: dto.level ?? null,
  };
}

export function mapTechStackUpdateInputDTO(data: Partial<TechStackInputDTO>) {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.level !== undefined && { level: data.level ?? null }),
  };
}
