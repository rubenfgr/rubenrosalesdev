import { createServerFn } from "@tanstack/react-start";
import type { PostCreateDTO, PostIdDTO, PostUpdateDTO } from "@/shared/dto";
import { mapPostCreateDTO, mapPostUpdateDTO } from "@/shared/mappers";
import { PostCreateValidator, PostIdValidator, PostUpdateValidator } from "@/shared/validators";
import { postService } from "./post.service";

export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  return postService.getAllPosts();
});

export const getPost = createServerFn({ method: "GET" })
  .validator((input: PostIdDTO) => PostIdValidator.parse(input))
  .handler(async (ctx) => {
    return postService.getPostById(ctx.data.id);
  });

export const createPostServer = createServerFn({ method: "POST" })
  .validator((input: PostCreateDTO) => PostCreateValidator.parse(input))
  .handler(async (ctx) => {
    const mapped = mapPostCreateDTO(ctx.data);
    return postService.createPost(mapped);
  });

export const updatePostServer = createServerFn({ method: "POST" })
  .validator((input: PostUpdateDTO) => PostUpdateValidator.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapPostUpdateDTO(data);
    return postService.updatePost(id, mapped);
  });

export const deletePostServer = createServerFn({ method: "POST" })
  .validator((input: PostIdDTO) => PostIdValidator.parse(input))
  .handler(async (ctx) => {
    return postService.deletePost(ctx.data.id);
  });
