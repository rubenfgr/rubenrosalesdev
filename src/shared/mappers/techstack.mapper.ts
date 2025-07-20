import type { TechStackCreateDTO } from "../dto/techstack.dto";

export function mapTechStackCreateDTO(dto: TechStackCreateDTO) {
  return {
    name: dto.name,
    level: dto.level ?? null,
  };
}

export function mapTechStackUpdateDTO(data: Partial<TechStackCreateDTO>) {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.level !== undefined && { level: data.level ?? null }),
  };
}
