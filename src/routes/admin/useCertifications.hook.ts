import { useQuery } from '@tanstack/react-query';
import { listCertifications } from '~/server/functions/certification.server';

export function useCertifications() {
  return useQuery({
    queryKey: ['certifications'],
    queryFn: async () => {
      const res = await listCertifications();
      return res;
    },
  });
}
