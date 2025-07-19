import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CertificationInputDTO } from '../../server/models/certification.model';
import { createCertificationServer } from '~/server/functions/certification.server';

export function useCreateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CertificationInputDTO) => {
      const res = await createCertificationServer({
        data: data,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    },
  });
}
