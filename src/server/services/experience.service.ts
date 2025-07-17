import { PrismaClient, Experience } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllExperiences(): Promise<Experience[]> {
  return prisma.experience.findMany({
    orderBy: { startDate: 'desc' },
    include: { techStack: true, user: true },
  });
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  return prisma.experience.findUnique({
    where: { id },
    include: { techStack: true, user: true },
  });
}

export async function createExperience(data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Promise<Experience> {
  return prisma.experience.create({ data });
}

export async function updateExperience(id: string, data: Partial<Experience>): Promise<Experience> {
  return prisma.experience.update({ where: { id }, data });
}

export async function deleteExperience(id: string): Promise<Experience> {
  return prisma.experience.delete({ where: { id } });
}
