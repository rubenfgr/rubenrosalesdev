import { PrismaClient, type Profile } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllProfiles(): Promise<Profile[]> {
  return prisma.profile.findMany({
    include: { user: true },
  });
}

export async function getProfileById(id: string): Promise<Profile | null> {
  return prisma.profile.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function createProfile(data: Omit<Profile, "id">): Promise<Profile> {
  return prisma.profile.create({ data });
}

export async function updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
  return prisma.profile.update({ where: { id }, data });
}

export async function deleteProfile(id: string): Promise<Profile> {
  return prisma.profile.delete({ where: { id } });
}
