export type Category = {
  slug: string;
  id: string;
  name: string;
  image: string;
  description: string;
  server_id: string;
  type: 'listed_products' | 'single_products';
  addons?: {
    id: string;
    title: string;
    features: {
      id: string;
      title: string;
      info: string;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
};
