import { type Post, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllPosts(): Promise<Post[]> {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { techStack: true, author: true },
  });
}

export async function getPostById(id: string): Promise<Post | null> {
  return prisma.post.findUnique({
    where: { id },
    include: { techStack: true, author: true },
  });
}

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
): Promise<Post> {
  return prisma.post.create({ data });
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: string): Promise<Post> {
  return prisma.post.delete({ where: { id } });
}
