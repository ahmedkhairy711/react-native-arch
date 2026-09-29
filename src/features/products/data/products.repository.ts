import type { HttpClient } from '@/core/network/http-client';

import { productsResponseDto, toProduct } from './products.dto';
import type { ProductsPage } from '../domain/product';

export interface ProductsRepository {
  getProducts(params: { page: number; pageSize: number; signal?: AbortSignal }): Promise<ProductsPage>;
}

export class ProductsRepositoryImpl implements ProductsRepository {
  constructor(private readonly http: HttpClient) {}

  async getProducts({ page, pageSize, signal }: { page: number; pageSize: number; signal?: AbortSignal }) {
    const json = await this.http.get('/products', {
      params: {
        skip: page * pageSize,
        limit: pageSize,
        // Only fetch the fields the UI needs: smaller payloads, less memory.
        select: 'id,title,description,price,rating,thumbnail',
      },
      signal, // cancelled automatically when the screen unmounts
    });
    const dto = productsResponseDto.parse(json);
    const hasMore = dto.skip + dto.products.length < dto.total;
    return { items: dto.products.map(toProduct), nextPage: hasMore ? page + 1 : undefined };
  }
}
