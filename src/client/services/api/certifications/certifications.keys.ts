/**
 * Query keys for certifications
 */
export const certificationKeys = {
  all: ["certifications"] as const,
  detail: (id: string) => [...certificationKeys.all, id] as const,
};
