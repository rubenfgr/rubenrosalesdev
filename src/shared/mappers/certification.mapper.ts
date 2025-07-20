import type { CertificationCreateDTO } from "@/shared/dto/certification.dto";

export function mapCertificationCreateDTO(dto: CertificationCreateDTO) {
  return {
    name: dto.name,
    issuer: dto.issuer,
    date: dto.date,
    url: dto.url ?? null,
    userId: dto.userId,
  };
}

export function mapCertificationUpdateDTO(
  data: Partial<CertificationCreateDTO>,
) {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.issuer !== undefined && { issuer: data.issuer }),
    ...(data.date !== undefined && { date: data.date }),
    ...(data.url !== undefined && { url: data.url ?? null }),
    ...(data.userId !== undefined && { userId: data.userId }),
  };
}
