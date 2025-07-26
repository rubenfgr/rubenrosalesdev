import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createCertificationServer,
  deleteCertificationServer,
  deleteCertificationsServer,
  getCertification,
  listCertifications,
  updateCertificationServer,
} from "@/server/modules/certifications/certification.server";
import type {
  CertificationCreateDTO,
  CertificationIdDTO,
  CertificationUpdateDTO,
} from "@/shared/dto";
import { certificationKeys } from "./certifications.keys";

/**
 * Hook to fetch all certifications
 */
export const useGetAllCertifications = () => {
  const getAllCertifications = useServerFn(listCertifications);

  return useQuery({
    queryKey: certificationKeys.all,
    queryFn: () => getAllCertifications(),
  });
};

/**
 * Hook to fetch a certification by id
 */
export const useGetCertification = (id: string) => {
  const getCert = useServerFn(getCertification);
  return useQuery({
    queryKey: certificationKeys.detail(id),
    queryFn: () => getCert({ data: { id } }),
    enabled: !!id && id !== "new",
  });
};

/**
 * Hook para crear una certificación
 */
export const useCreateCertification = () => {
  const createCert = useServerFn(createCertificationServer);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CertificationCreateDTO) => createCert({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationKeys.all });
    },
  });
};

/**
 * Hook para actualizar una certificación
 */
export const useUpdateCertification = () => {
  const updateCert = useServerFn(updateCertificationServer);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CertificationUpdateDTO) => updateCert({ data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: certificationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: certificationKeys.all });
    },
  });
};

/**
 * Hook para eliminar una certificación
 */
export const useDeleteCertification = () => {
  const deleteCert = useServerFn(deleteCertificationServer);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CertificationIdDTO) => deleteCert({ data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: certificationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: certificationKeys.all });
    },
  });
};

/**
 * Hook para eliminar múltiples certificaciones
 */
export const useDeleteCertifications = () => {
  const deleteCerts = useServerFn(deleteCertificationsServer);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { ids: string[] }) => deleteCerts({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationKeys.all });
    },
  });
};
