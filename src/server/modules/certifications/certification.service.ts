import type { Certification, Prisma } from "@prisma/client";
import { prisma } from "@/server/services/prisma";
import { serverTranslation } from "@/server/services/use-server-translation";
import type { CertificationListParams } from "@/shared/validators/certification-list.validator";

const getAllCertifications = async (
  params: CertificationListParams = {},
): Promise<{ data: Certification[]; total: number }> => {
  const { page = 1, pageSize = 20, filter, sort } = params;
  const where = filter ? (filter as Prisma.CertificationWhereInput) : undefined;
  let orderBy: Prisma.CertificationOrderByWithRelationInput = { date: "desc" };
  if (sort?.field && sort?.direction) {
    orderBy = { [sort.field]: sort.direction } as Prisma.CertificationOrderByWithRelationInput;
  }
  const [data, total] = await Promise.all([
    prisma.certification.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy,
      include: { user: true },
    }),
    prisma.certification.count({ where }),
  ]);
  return { data, total };
};

const getCertificationById = async (id: string): Promise<Certification | null> => {
  return prisma.certification.findUnique({
    where: { id },
    include: { user: true },
  });
};

const createCertification = async (data: Omit<Certification, "id">): Promise<Certification> => {
  return prisma.certification.create({ data });
};

const updateCertification = async (
  id: string,
  data: Partial<Certification>,
): Promise<Certification> => {
  const { t } = serverTranslation();
  const certification = await getCertificationById(id);
  if (!certification) {
    throw new Error(t("not_found"));
  }
  return prisma.certification.update({ where: { id }, data });
};

const deleteCertification = async (id: string): Promise<Certification> => {
  const { t } = serverTranslation();
  const certification = await getCertificationById(id);
  if (!certification) {
    throw new Error(t("not_found"));
  }
  return prisma.certification.delete({ where: { id } });
};

const deleteCertifications = async (ids: string[]): Promise<{ count: number }> => {
  const { t } = serverTranslation();
  const certifications = await prisma.certification.findMany({
    where: { id: { in: ids } },
  });
  if (certifications.length !== ids.length) {
    throw new Error(t("not_found"));
  }
  return prisma.certification.deleteMany({ where: { id: { in: ids } } });
};

export const certificationService = {
  getAllCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
  deleteCertifications,
};
