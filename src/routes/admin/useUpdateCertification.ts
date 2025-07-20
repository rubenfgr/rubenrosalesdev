import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCertificationServer } from "~/server/modules/certifications/certification.server";
import type { CertificationUpdateDTO } from "~/shared/dto/certification.dto";

export function useUpdateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CertificationUpdateDTO) => {
      const res = await updateCertificationServer({
        data: data,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
    },
  });
}
