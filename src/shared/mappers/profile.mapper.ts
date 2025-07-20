import type { ProfileInputDTO } from "../dto/profile.dto";

export function mapProfileInputDTO(dto: ProfileInputDTO) {
  return {
    bio: dto.bio ?? null,
    avatarUrl: dto.avatarUrl ?? null,
    location: dto.location ?? null,
    website: dto.website ?? null,
    userId: dto.userId,
  };
}

export function mapProfileUpdateInputDTO(data: Partial<ProfileInputDTO>) {
  return {
    ...(data.bio !== undefined && { bio: data.bio ?? null }),
    ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl ?? null }),
    ...(data.location !== undefined && { location: data.location ?? null }),
    ...(data.website !== undefined && { website: data.website ?? null }),
    ...(data.userId !== undefined && { userId: data.userId }),
  };
}
