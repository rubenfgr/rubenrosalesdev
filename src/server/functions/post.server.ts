import { getAllPosts, getPostById, createPost, updatePost, deletePost } from '../services/post.service';
import {
  PostInput,
  PostInputDTO,
  PostUpdateInput,
  PostUpdateInputDTO,
  PostId,
  PostIdDTO,
} from '../models/post.model';
import {
  mapPostInputDTO,
  mapPostUpdateInputDTO,
} from '../mappers/post.mapper';


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
