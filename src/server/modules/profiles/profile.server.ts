import { createServerFn } from "@tanstack/react-start";
import type { ProfileCreateDTO, ProfileIdDTO, ProfileUpdateDTO } from "@/shared/dto";
import {
  ProfileCreateValidator,
  ProfileIdValidator,
  ProfileUpdateValidator,
} from "@/shared/validators";
import { mapProfileCreateDTO, mapProfileUpdateDTO } from "~/shared/mappers";
import { profileService } from "./profile.service";

export const listProfiles = createServerFn({ method: "GET" }).handler(async () => {
  return profileService.getAllProfiles();
});

export const getProfile = createServerFn({ method: "GET" })
  .validator((input: ProfileIdDTO) => ProfileIdValidator.parse(input))
  .handler(async (ctx) => {
    return profileService.getProfileById(ctx.data.id);
  });

export const createProfileServer = createServerFn({ method: "POST" })
  .validator((input: ProfileCreateDTO) => ProfileCreateValidator.parse(input))
  .handler(async (ctx) => {
    const mapped = mapProfileCreateDTO(ctx.data);
    return profileService.createProfile(mapped);
  });

export const updateProfileServer = createServerFn({ method: "POST" })
  .validator((input: ProfileUpdateDTO) => ProfileUpdateValidator.parse(input))
  .handler(async (ctx) => {
    const { id, data } = ctx.data;
    const mapped = mapProfileUpdateDTO(data);
    return profileService.updateProfile(id, mapped);
  });

export const deleteProfileServer = createServerFn({ method: "POST" })
  .validator((input: ProfileIdDTO) => ProfileIdValidator.parse(input))
  .handler(async (ctx) => {
    return profileService.deleteProfile(ctx.data.id);
  });
