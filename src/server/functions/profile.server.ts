import { createServerFn } from '@tanstack/react-start';
import { getAllProfiles, getProfileById, createProfile, updateProfile, deleteProfile } from '../services/profile.service';
import {
  ProfileInput,
  ProfileInputDTO,
  ProfileUpdateInput,
  ProfileUpdateInputDTO,
  ProfileId,
  ProfileIdDTO,
} from '../../shared/dto/profile.model';
import {
  mapProfileInputDTO,
  mapProfileUpdateInputDTO,
} from '../../shared/mappers/profile.mapper';

export const listProfiles = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getAllProfiles();
  });

export const getProfile = createServerFn({ method: 'GET' })
  .validator((input: ProfileIdDTO) => ProfileId.parse(input))
  .handler(async (ctx) => {
    return getProfileById(ctx.data.id);
  });
export const deleteProfileServer = createServerFn({ method: 'POST' })
  .validator((input: ProfileIdDTO) => ProfileId.parse(input))
  .handler(async (ctx) => {
    return deleteProfile(ctx.data.id);
  });
