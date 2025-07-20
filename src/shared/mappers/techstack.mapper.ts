import { TechStackInputDTO } from '../dto/techstack.model';

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
