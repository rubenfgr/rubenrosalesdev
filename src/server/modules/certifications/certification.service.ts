import type { Certification } from "@prisma/client";
import { prisma } from "@/server/services/prisma";
import { serverTranslation } from "@/server/services/use-server-translation";

const getAllCertifications = async (): Promise<Certification[]> => {
  return prisma.certification.findMany({
    orderBy: { date: "desc" },
    include: { user: true },
  });
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
