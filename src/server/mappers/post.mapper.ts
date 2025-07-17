import { PostInputDTO } from '../models/post.model';

export function mapPostInputDTO(dto: PostInputDTO) {
  return {
    title: dto.title,
    summary: dto.summary ?? null,
    content: dto.content,
    published: dto.published ?? false,
    status: dto.status ?? 'draft',
    tags: dto.tags ?? [],
    publishedAt: dto.publishedAt ?? null,
    authorId: dto.authorId,
  };
}

export function mapPostUpdateInputDTO(data: Partial<PostInputDTO>) {
  return {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.summary !== undefined && { summary: data.summary ?? null }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.published !== undefined && { published: data.published }),
    ...(data.status !== undefined && { status: data.status ?? 'draft' }),
    ...(data.tags !== undefined && { tags: data.tags ?? [] }),
    ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt ?? null }),
    ...(data.authorId !== undefined && { authorId: data.authorId }),
  };
}
