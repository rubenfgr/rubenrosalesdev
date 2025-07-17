import { CertificationInputDTO } from '../models/certification.model';

export function mapCertificationInputDTO(dto: CertificationInputDTO) {
  return {
    name: dto.name,
    issuer: dto.issuer,
    date: dto.date,
    url: dto.url ?? null,
    userId: dto.userId,
  };
}

export function mapCertificationUpdateInputDTO(data: Partial<CertificationInputDTO>) {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.issuer !== undefined && { issuer: data.issuer }),
    ...(data.date !== undefined && { date: data.date }),
    ...(data.url !== undefined && { url: data.url ?? null }),
    ...(data.userId !== undefined && { userId: data.userId }),
  };
}
