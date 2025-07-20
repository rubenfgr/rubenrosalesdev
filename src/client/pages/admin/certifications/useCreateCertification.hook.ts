import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCertificationServer } from "~/server/modules/certifications/certification.server";
import type { CertificationCreateDTO } from "../../../../shared/dto/certification.dto";

export function useCreateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CertificationCreateDTO) => {
      const res = await createCertificationServer({
        data: data,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
    },
  });
}
