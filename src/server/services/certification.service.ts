import { PrismaClient, Certification } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllCertifications(): Promise<Certification[]> {
  return prisma.certification.findMany({
    orderBy: { date: 'desc' },
    include: { user: true },
  });
}

export async function getCertificationById(id: string): Promise<Certification | null> {
  return prisma.certification.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function createCertification(data: Omit<Certification, 'id'>): Promise<Certification> {
  return prisma.certification.create({ data });
}

export async function updateCertification(id: string, data: Partial<Certification>): Promise<Certification> {
  return prisma.certification.update({ where: { id }, data });
}

export async function deleteCertification(id: string): Promise<Certification> {
  return prisma.certification.delete({ where: { id } });
}
