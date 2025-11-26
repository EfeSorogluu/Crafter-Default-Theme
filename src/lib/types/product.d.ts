export interface SelectedAddon {
  addonId: string;
  features: Array<{
    featureId: string;
    included: boolean;
    customValue?: string | null;
  }>;
}

export type Product = {
  slug: Key | null | undefined;
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  server_id: string;
  tags: string[];
  stock: number;
  createdAt: string;
  updatedAt: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  server_commands?: string[];
  selectedAddons?: SelectedAddon[];
};
