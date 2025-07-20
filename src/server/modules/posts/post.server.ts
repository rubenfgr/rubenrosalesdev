import type { PostCreateDTO } from "@/shared/dto";
import { mapPostCreateDTO, mapPostUpdateDTO } from "@/shared/mappers";
import { PostCreateValidator } from "@/shared/validators";
import { createPost, deletePost, getAllPosts, getPostById, updatePost } from "./post.service";

export const listPosts = async () => {
  return getAllPosts();
};

export const getPost = async (id: string) => {
  return getPostById(id);
};

export const createPostServer = async (input: PostCreateDTO) => {
  const data = PostCreateValidator.parse(input);
  const mapped = mapPostCreateDTO(data);
  return createPost(mapped);
};

export const updatePostServer = async (id: string, input: Partial<PostCreateDTO>) => {
  const data = PostCreateValidator.partial().parse(input);
  const mapped = mapPostUpdateDTO(data);
  return updatePost(id, mapped);
};

export const deletePostServer = async (id: string) => {
  return deletePost(id);
};
