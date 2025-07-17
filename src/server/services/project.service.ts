import { PrismaClient, Project } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllProjects(): Promise<Project[]> {
  return prisma.project.findMany({
    orderBy: { startDate: 'desc' },
    include: { techStack: true, user: true },
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  return prisma.project.findUnique({
    where: { id },
    include: { techStack: true, user: true },
  });
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  return prisma.project.create({ data });
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id: string): Promise<Project> {
  return prisma.project.delete({ where: { id } });
}
