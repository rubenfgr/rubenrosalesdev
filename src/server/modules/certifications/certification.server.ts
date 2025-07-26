import { createServerFn } from "@tanstack/react-start";
import type {
  CertificationCreateDTO,
  CertificationIdDTO,
  CertificationIdsDTO,
  CertificationUpdateDTO,
} from "@/shared/dto";
import { mapCertificationCreateDTO, mapCertificationUpdateDTO } from "@/shared/mappers";
import {
  CertificationCreateValidator,
  CertificationIdsValidator,
  CertificationIdValidator,
  CertificationUpdateValidator,
} from "@/shared/validators";
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
    const mapped = mapCertificationCreateDTO(ctx.data);
    return certificationService.createCertification(mapped);
  });

export const updateCertificationServer = createServerFn({ method: "POST" })
  .validator((input: CertificationUpdateDTO) => CertificationUpdateValidator.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapCertificationUpdateDTO(data);
    return certificationService.updateCertification(id, mapped);
  });

export const deleteCertificationServer = createServerFn({ method: "POST" })
  .validator((input: CertificationIdDTO) => CertificationIdValidator.parse(input))
  .handler(async (ctx) => {
    return certificationService.deleteCertification(ctx.data.id);
  });

export const deleteCertificationsServer = createServerFn({ method: "POST" })
  .validator((input: CertificationIdsDTO) => {
    return CertificationIdsValidator.parse(input);
  })
  .handler(async (ctx) => {
    return certificationService.deleteCertifications(ctx.data.ids);
  });
