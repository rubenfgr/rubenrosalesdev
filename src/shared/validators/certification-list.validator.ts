import z from "zod";

export const CertificationListParamsValidator = z.object({
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    filter: z.record(z.string(), z.unknown()).optional(),
    sort: z
        .object({
            field: z.string(),
            direction: z.enum(["asc", "desc"]),
        })
        .optional(),
});

export type CertificationListParams = z.infer<typeof CertificationListParamsValidator>;
