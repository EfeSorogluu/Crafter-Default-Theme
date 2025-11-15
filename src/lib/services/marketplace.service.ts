import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL } from "../constants/base";

export type Coupon = {
  "id": string,
  "code": string,
  "type": "product_discount" | "cart_discount" | "free_product",
  "minCartValue": null | number,
  "productId": null | string,
  "discountValue": number,
  "discountType": "percentage" | "fixed",
  "freeProductId": null | string,
  "isActive": boolean,
}

export type MarketplaceSettings = {
  bulkDiscount: {
    type: "percentage" | "fixed";
    amount: number;
    expireDate: string | null;
    products: string[];
  } | null;
};

export const useMarketplaceService = () => {
  const { post, get } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true });

  const purchaseProduct = async (
    productIds: string[],
    coupon?: string
  ): Promise<{ success: string; message: string; type: string }> => {
    const response = await post<{
      success: string;
      message: string;
      type: string;
    }>(`/marketplace/purchase`, { productIds, coupon }, {}, true);
    return response.data;
  };

  const getCouponInfo = async (couponCode: string): Promise<Coupon> => {
    const response = await get<Coupon>(`/coupons/${couponCode}`, {}, true);
    return response.data;
  };

  const getMarketplaceSettings = async (): Promise<MarketplaceSettings> => {
    const response = await get<MarketplaceSettings>(`/config/marketplace`, {}, true);
    return response.data;
  };

  return {
    purchaseProduct,
    getCouponInfo,
    getMarketplaceSettings,
  };
};
