import { PrismaClient, TechStack } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllTechStack(): Promise<TechStack[]> {
  return prisma.techStack.findMany({
    orderBy: { name: 'asc' },
    include: { projects: true, experiences: true, posts: true },
  });
}

export async function getTechStackById(id: string): Promise<TechStack | null> {
  return prisma.techStack.findUnique({
    where: { id },
    include: { projects: true, experiences: true, posts: true },
  });
}

export async function createTechStack(data: Omit<TechStack, 'id'>): Promise<TechStack> {
  return prisma.techStack.create({ data });
}

export async function updateTechStack(id: string, data: Partial<TechStack>): Promise<TechStack> {
  return prisma.techStack.update({ where: { id }, data });
}

export async function deleteTechStack(id: string): Promise<TechStack> {
  return prisma.techStack.delete({ where: { id } });
}
