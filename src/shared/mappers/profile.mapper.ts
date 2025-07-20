import type { ProfileCreateDTO } from "../dto/profile.dto";

export function mapProfileCreateDTO(dto: ProfileCreateDTO) {
  return {
    bio: dto.bio ?? "",
    avatarUrl: dto.avatarUrl ?? null,
    location: dto.location ?? null,
    website: dto.website ?? null,
    userId: dto.userId,
  };
}

export function mapProfileUpdateDTO(data: Partial<ProfileCreateDTO>) {
  return {
    ...(data.bio !== undefined && { bio: data.bio ?? "" }),
    ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl ?? null }),
    ...(data.location !== undefined && { location: data.location ?? null }),
    ...(data.website !== undefined && { website: data.website ?? null }),
    ...(data.userId !== undefined && { userId: data.userId }),
  };
}
