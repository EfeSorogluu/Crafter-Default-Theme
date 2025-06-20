import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL_WITH_WEBSITE_ID } from "../constants/base";

export const useChestService = () => {
  const { post, get } = useApi({ baseUrl: BACKEND_URL_WITH_WEBSITE_ID });

  const getChestItems = async (
    user_id: string
  ): Promise<{ success: boolean; message: string; type: string }> => {
    const response = await get<{
      success: boolean;
      message: string;
      type: string;
    }>(`/chest/${user_id}`, {}, true);
    return response.data;
  };

  const useChestItem = async (
    user_id: string,
    product_id: string
  ): Promise<{ success: boolean; message: string; type: string }> => {
    const response = await post<{
      success: boolean;
      message: string;
      type: string;
    }>(`/chest/${user_id}/use/${product_id}`, {}, {}, true);

    return response.data;
  };

  return {
    getChestItems,
    useChestItem
  };
};
