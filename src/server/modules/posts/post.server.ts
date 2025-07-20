import { PostInput, type PostInputDTO } from "@/shared/dto";
import { mapPostInputDTO, mapPostUpdateInputDTO } from "@/shared/mappers";
import { createPost, deletePost, getAllPosts, getPostById, updatePost } from "./post.service";

export const listPosts = async () => {
  return getAllPosts();
};

export const getPost = async (id: string) => {
  return getPostById(id);
};

export const createPostServer = async (input: PostInputDTO) => {
  const data = PostInput.parse(input);
  const mapped = mapPostInputDTO(data);
  return createPost(mapped);
};

export const updatePostServer = async (id: string, input: Partial<PostInputDTO>) => {
  const data = PostInput.partial().parse(input);
  const mapped = mapPostUpdateInputDTO(data);
  return updatePost(id, mapped);
};

export const deletePostServer = async (id: string) => {
  return deletePost(id);
};
