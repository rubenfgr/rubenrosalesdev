import type { PostCreateDTO } from "../dto/post.dto";
import { POST_STATUS } from "../enums/post-status.enum";

export function mapPostCreateDTO(dto: PostCreateDTO) {
  return {
    title: dto.title,
    summary: dto.summary ?? null,
    content: dto.content,
    published: dto.published ?? false,
    status: dto.status ?? POST_STATUS[0],
    tags: dto.tags ?? [],
    publishedAt: dto.publishedAt ?? null,
    authorId: dto.authorId,
  };
}

export function mapPostUpdateDTO(data: Partial<PostCreateDTO>) {
  return {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.summary !== undefined && { summary: data.summary ?? null }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.published !== undefined && { published: data.published }),
    ...(data.status !== undefined && { status: data.status ?? POST_STATUS[0] }),
    ...(data.tags !== undefined && { tags: data.tags ?? [] }),
    ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt ?? null }),
    ...(data.authorId !== undefined && { authorId: data.authorId }),
  };
}
