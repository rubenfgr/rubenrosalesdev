import { type Post, PrismaClient } from "@prisma/client";
import { serverTranslation } from "@/server/services/use-server-translation";

const prisma = new PrismaClient();

async function getAllPosts(): Promise<Post[]> {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { techStack: true, author: true },
  });
}

async function getPostById(id: string): Promise<Post | null> {
  return prisma.post.findUnique({
    where: { id },
    include: { techStack: true, author: true },
  });
}

async function createPost(data: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<Post> {
  return prisma.post.create({ data });
}

async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  const { t } = serverTranslation();
  const post = await getPostById(id);
  if (!post) {
    throw new Error(t("not_found"));
  }
  return prisma.post.update({ where: { id }, data });
}

async function deletePost(id: string): Promise<Post> {
  const { t } = serverTranslation();
  const post = await getPostById(id);
  if (!post) {
    throw new Error(t("not_found"));
  }
  return prisma.post.delete({ where: { id } });
}

export const postService = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
