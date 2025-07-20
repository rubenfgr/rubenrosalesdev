import { createServerFn } from "@tanstack/react-start";
import type {
  CertificationCreateDTO,
  CertificationIdDTO,
  CertificationUpdateDTO,
} from "@/shared/dto/certification.dto";
import {
  mapCertificationInputDTO,
  mapCertificationUpdateInputDTO,
} from "@/shared/mappers/certification.mapper";
import {
  CertificationCreateValidator,
  CertificationIdValidator,
  CertificationUpdateValidator,
} from "@/shared/validators/certification.validator";
import { certificationService } from "./certification.service";

export const listCertifications = createServerFn({ method: "GET" }).handler(async () => {
  return certificationService.getAllCertifications();
});

export const getCertification = createServerFn({ method: "GET" })
  .validator((input: CertificationIdDTO) => CertificationIdValidator.parse(input))
  .handler(async (ctx) => {
    return certificationService.getCertificationById(ctx.data.id);
  });

export const createCertificationServer = createServerFn({ method: "POST" })
  .validator((input: CertificationCreateDTO) => CertificationCreateValidator.parse(input))
  .handler(async (ctx) => {
    const mapped = mapCertificationInputDTO(ctx.data);
    return certificationService.createCertification(mapped);
  });

export const updateCertificationServer = createServerFn({ method: "POST" })
  .validator((input: CertificationUpdateDTO) => CertificationUpdateValidator.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapCertificationUpdateInputDTO(data);
    return certificationService.updateCertification(id, mapped);
  });

export const deleteCertificationServer = createServerFn({ method: "POST" })
  .validator((input: CertificationIdDTO) => CertificationIdValidator.parse(input))
  .handler(async (ctx) => {
    return certificationService.deleteCertification(ctx.data.id);
  });
