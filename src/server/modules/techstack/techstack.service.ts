import { PrismaClient, type TechStack } from "@prisma/client";
import { serverTranslation } from "@/server/services/use-server-translation";

const prisma = new PrismaClient();

async function getAllTechStack(): Promise<TechStack[]> {
  return prisma.techStack.findMany({
    orderBy: { name: "asc" },
    include: { projects: true, experiences: true, posts: true },
  });
}

async function getTechStackById(id: string): Promise<TechStack | null> {
  return prisma.techStack.findUnique({
    where: { id },
    include: { projects: true, experiences: true, posts: true },
  });
}

async function createTechStack(data: Omit<TechStack, "id">): Promise<TechStack> {
  return prisma.techStack.create({ data });
}

async function updateTechStack(id: string, data: Partial<TechStack>): Promise<TechStack> {
  const { t } = serverTranslation();
  const techStack = await getTechStackById(id);
  if (!techStack) {
    throw new Error(t("not_found"));
  }
  return prisma.techStack.update({ where: { id }, data });
}

async function deleteTechStack(id: string): Promise<TechStack> {
  const { t } = serverTranslation();
  const techStack = await getTechStackById(id);
  if (!techStack) {
    throw new Error(t("not_found"));
  }
  return prisma.techStack.delete({ where: { id } });
}

export const techStackService = {
  getAllTechStack,
  getTechStackById,
  createTechStack,
  updateTechStack,
  deleteTechStack,
};
