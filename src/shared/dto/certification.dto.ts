import type z from "zod";
import type {
    CertificationCreateValidator,
    CertificationIdValidator,
    CertificationUpdateValidator,
} from "../validators/certification.validator";

export type CertificationDTO = z.infer<typeof CertificationCreateValidator> & {
    id: string;
};

export type CertificationCreateDTO = z.infer<
    typeof CertificationCreateValidator
>;

export type CertificationUpdateDTO = z.infer<
    typeof CertificationUpdateValidator
>;

export type CertificationIdDTO = z.infer<typeof CertificationIdValidator>;
