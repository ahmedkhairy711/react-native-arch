export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  thumbnailUrl: string;
};

export type ProductsPage = {
  items: Product[];
  /** undefined when this is the last page. */
  nextPage: number | undefined;
};
