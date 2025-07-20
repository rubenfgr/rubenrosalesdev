import type { TechStackCreateDTO } from "../dto/techstack.dto";
import { SKILL_LEVEL } from "../enums/skill-level.enum";

export function mapTechStackCreateDTO(dto: TechStackCreateDTO) {
  return {
    name: dto.name,
    level: dto.level ?? SKILL_LEVEL[0],
  };
}

export function mapTechStackUpdateDTO(data: Partial<TechStackCreateDTO>) {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.level !== undefined && { level: data.level ?? SKILL_LEVEL[0] }),
  };
}
