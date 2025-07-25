import type z from "zod";
import type {
  CertificationCreateValidator,
  CertificationIdsValidator,
  CertificationIdValidator,
  CertificationUpdateValidator,
} from "@/shared/validators/certification.validator";

export type CertificationIdDTO = z.infer<typeof CertificationIdValidator>;

export type CertificationIdsDTO = z.infer<typeof CertificationIdsValidator>;

export type CertificationDTO = z.infer<typeof CertificationCreateValidator> & {
  id: string;
};

export type CertificationCreateDTO = z.infer<typeof CertificationCreateValidator>;

export type CertificationUpdateDTO = z.infer<typeof CertificationUpdateValidator>;
