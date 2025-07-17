import { createServerFn } from '@tanstack/react-start';
import { getAllCertifications, getCertificationById, createCertification, updateCertification, deleteCertification } from '../services/certification.service';

import {
  mapCertificationInputDTO,
  mapCertificationUpdateInputDTO,
} from '../mappers/certification.mapper';
import { CertificationId, CertificationIdDTO, CertificationInput, CertificationInputDTO, CertificationUpdateInput, CertificationUpdateInputDTO } from '../models/certification.model';

export const listCertifications = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getAllCertifications();
  });

export const getCertification = createServerFn({ method: 'GET' })
  .validator((input: CertificationIdDTO) => CertificationId.parse(input))
  .handler(async (ctx) => {
    return getCertificationById(ctx.data.id);
  });

export const createCertificationServer = createServerFn({ method: 'POST' })
  .validator((input: CertificationInputDTO) => CertificationInput.parse(input))
  .handler(async (ctx) => {
    const mapped = mapCertificationInputDTO(ctx.data);
    return createCertification(mapped);
  });

export const updateCertificationServer = createServerFn({ method: 'POST' })
  .validator((input: CertificationUpdateInputDTO) => CertificationUpdateInput.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapCertificationUpdateInputDTO(data);
    return updateCertification(id, mapped);
  });

export const deleteCertificationServer = createServerFn({ method: 'POST' })
  .validator((input: CertificationIdDTO) => CertificationId.parse(input))
  .handler(async (ctx) => {
    return deleteCertification(ctx.data.id);
  });
