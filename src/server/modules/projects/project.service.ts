import { PrismaClient, type Project } from "@prisma/client";
import { serverTranslation } from "@/server/services/use-server-translation";

const prisma = new PrismaClient();

async function getAllProjects(): Promise<Project[]> {
  return prisma.project.findMany({
    orderBy: { startDate: "desc" },
    include: { techStack: true, user: true },
  });
}

async function getProjectById(id: string): Promise<Project | null> {
  return prisma.project.findUnique({
    where: { id },
    include: { techStack: true, user: true },
  });
}

async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">,
): Promise<Project> {
  return prisma.project.create({ data });
}

async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const { t } = serverTranslation();
  const project = await getProjectById(id);
  if (!project) {
    throw new Error(t("not_found"));
  }
  return prisma.project.update({ where: { id }, data });
}

async function deleteProject(id: string): Promise<Project> {
  const { t } = serverTranslation();
  const project = await getProjectById(id);
  if (!project) {
    throw new Error(t("not_found"));
  }
  return prisma.project.delete({ where: { id } });
}

export const projectService = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
