import { z } from 'zod';

import type { AuthTokens } from '@/core/storage/token-storage';

import type { User } from '../domain/user';

/**
 * DTOs = API contract. Parsed with zod at the boundary so bad/unexpected payloads
 * fail here (as ApiError 'parsing') instead of crashing deep inside a screen.
 */
export const userDto = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image: z.string(),
});

export const tokensDto = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const loginResponseDto = userDto.extend(tokensDto.shape);

export type UserDto = z.infer<typeof userDto>;

export const toUser = (dto: UserDto): User => ({
  id: dto.id,
  username: dto.username,
  email: dto.email,
  fullName: `${dto.firstName} ${dto.lastName}`.trim(),
  avatarUrl: dto.image,
});

export const toTokens = (dto: z.infer<typeof tokensDto>): AuthTokens => ({
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
});
