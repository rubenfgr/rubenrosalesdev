import type { Certification } from "@prisma/client";
import { prisma } from "@/server/services/prisma";

const getAllCertifications = async (): Promise<Certification[]> => {
  return prisma.certification.findMany({
    orderBy: { date: "desc" },
    include: { user: true },
  });
};

const getCertificationById = async (
  id: string,
): Promise<Certification | null> => {
  return prisma.certification.findUnique({
    where: { id },
    include: { user: true },
  });
};

const createCertification = async (
  data: Omit<Certification, "id">,
): Promise<Certification> => {
  return prisma.certification.create({ data });
};

const updateCertification = async (
  id: string,
  data: Partial<Certification>,
): Promise<Certification> => {
  return prisma.certification.update({ where: { id }, data });
};

const deleteCertification = async (id: string): Promise<Certification> => {
  return prisma.certification.delete({ where: { id } });
};

export const certificationService = {
  getAllCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
};
