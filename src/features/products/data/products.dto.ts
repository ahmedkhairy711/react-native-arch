import { z } from 'zod';

import type { Product } from '../domain/product';

export const productDto = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  rating: z.number(),
  thumbnail: z.string(),
});

export const productsResponseDto = z.object({
  products: z.array(productDto),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export const toProduct = (dto: z.infer<typeof productDto>): Product => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  price: dto.price,
  rating: dto.rating,
  thumbnailUrl: dto.thumbnail,
});
