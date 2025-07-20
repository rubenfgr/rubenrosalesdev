import { PrismaClient, type Profile } from "@prisma/client";
import { serverTranslation } from "@/server/services/use-server-translation";

const prisma = new PrismaClient();

async function getAllProfiles(): Promise<Profile[]> {
  return prisma.profile.findMany({
    include: { user: true },
  });
}

async function getProfileById(id: string): Promise<Profile | null> {
  return prisma.profile.findUnique({
    where: { id },
    include: { user: true },
  });
}

async function createProfile(data: Omit<Profile, "id">): Promise<Profile> {
  return prisma.profile.create({ data });
}

async function updateProfile(id: string, data: Partial<Omit<Profile, "id">>): Promise<Profile> {
  const { t } = serverTranslation();
  const profile = await getProfileById(id);
  if (!profile) {
    throw new Error(t("not_found"));
  }
  return prisma.profile.update({ where: { id }, data });
}

async function deleteProfile(id: string): Promise<Profile> {
  const { t } = serverTranslation();
  const profile = await getProfileById(id);
  if (!profile) {
    throw new Error(t("not_found"));
  }
  return prisma.profile.delete({ where: { id } });
}

export const profileService = {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
};
