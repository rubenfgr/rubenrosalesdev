import { createServerFn } from "@tanstack/react-start";
import {
  ProfileId,
  type ProfileIdDTO,
} from "@/shared/dto";
import {
  deleteProfile,
  getAllProfiles,
  getProfileById,
} from "./profile.service";

export const listProfiles = createServerFn({ method: "GET" }).handler(async () => {
  return getAllProfiles();
});

export const getProfile = createServerFn({ method: "GET" })
  .validator((input: ProfileIdDTO) => ProfileId.parse(input))
  .handler(async (ctx) => {
    return getProfileById(ctx.data.id);
  });

export const deleteProfileServer = createServerFn({ method: "POST" })
  .validator((input: ProfileIdDTO) => ProfileId.parse(input))
  .handler(async (ctx) => {
    return deleteProfile(ctx.data.id);
  });
