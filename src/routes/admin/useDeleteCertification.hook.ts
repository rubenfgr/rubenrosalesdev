import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCertificationServer } from "~/server/modules/certifications/certification.server";
import type { CertificationIdDTO } from "../../shared/dto/certification.dto";

export function useDeleteCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CertificationIdDTO) => {
      const res = await deleteCertificationServer({
        data: data,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
    },
  });
}
