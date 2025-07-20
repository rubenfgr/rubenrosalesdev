import { type Experience, PrismaClient } from "@prisma/client";
import { serverTranslation } from "@/server/services/use-server-translation";

const prisma = new PrismaClient();

async function getAllExperiences(): Promise<Experience[]> {
  return prisma.experience.findMany({
    orderBy: { startDate: "desc" },
    include: { techStack: true, user: true },
  });
}

async function getExperienceById(id: string): Promise<Experience | null> {
  return prisma.experience.findUnique({
    where: { id },
    include: { techStack: true, user: true },
  });
}

async function createExperience(
  data: Omit<Experience, "id" | "createdAt" | "updatedAt">,
): Promise<Experience> {
  return prisma.experience.create({ data });
}

async function updateExperience(id: string, data: Partial<Experience>): Promise<Experience> {
  const { t } = serverTranslation();
  const experience = await getExperienceById(id);
  if (!experience) {
    throw new Error(t("not_found"));
  }
  return prisma.experience.update({ where: { id }, data });
}

async function deleteExperience(id: string): Promise<Experience> {
  const { t } = serverTranslation();
  const experience = await getExperienceById(id);
  if (!experience) {
    throw new Error(t("not_found"));
  }
  return prisma.experience.delete({ where: { id } });
}

export const experienceService = {
  getAllExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
};
