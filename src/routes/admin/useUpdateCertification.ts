import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCertificationServer } from '~/server/functions/certification.server';
import { CertificationUpdateInputDTO } from '~/server/models/certification.model';

export function useUpdateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CertificationUpdateInputDTO) => {
      const res = await updateCertificationServer({
        data: data,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    },
  });
}
