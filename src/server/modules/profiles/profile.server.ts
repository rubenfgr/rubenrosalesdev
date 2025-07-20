import { createServerFn } from "@tanstack/react-start";
import type { ProfileIdDTO } from "@/shared/dto";
import { ProfileIdValidator } from "@/shared/validators";
import { deleteProfile, getAllProfiles, getProfileById } from "./profile.service";

export const listProfiles = createServerFn({ method: "GET" }).handler(async () => {
  return getAllProfiles();
});

export const getProfile = createServerFn({ method: "GET" })
  .validator((input: ProfileIdDTO) => ProfileIdValidator.parse(input))
  .handler(async (ctx) => {
    return getProfileById(ctx.data.id);
  });

export const deleteProfileServer = createServerFn({ method: "POST" })
  .validator((input: ProfileIdDTO) => ProfileIdValidator.parse(input))
  .handler(async (ctx) => {
    return deleteProfile(ctx.data.id);
  });
