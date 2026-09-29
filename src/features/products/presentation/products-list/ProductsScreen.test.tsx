import { ApiError } from '@/core/network/api-error';
import type { ProductsRepository } from '@/features/products/data/products.repository';
import { renderWithProviders, screen } from '@test/test-utils';

import { ProductsScreen } from './ProductsScreen';

const product = {
  id: 1,
  title: 'Essence Mascara',
  description: 'Great mascara',
  price: 9.99,
  rating: 4.5,
  thumbnailUrl: 'https://img',
};

describe('ProductsScreen', () => {
  it('renders products from the repository', async () => {
    const productsRepository: ProductsRepository = {
      getProducts: jest.fn().mockResolvedValue({ items: [product], nextPage: undefined }),
    };
    await renderWithProviders(<ProductsScreen />, { productsRepository });

    expect(await screen.findByText('Essence Mascara')).toBeOnTheScreen();
    expect(screen.getByText('$9.99')).toBeOnTheScreen();
  });

  it('shows a translated error with retry', async () => {
    const productsRepository: ProductsRepository = {
      getProducts: jest.fn().mockRejectedValue(new ApiError('network', 'offline')),
    };
    await renderWithProviders(<ProductsScreen />, { productsRepository });

    expect(await screen.findByText(/No internet connection/)).toBeOnTheScreen();
    expect(screen.getByText('Try again')).toBeOnTheScreen();
  });
});
