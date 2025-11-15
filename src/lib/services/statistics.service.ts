import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL } from "../constants/base";
import { IPublicWebsiteStatistics } from "../types/statistics";

export const useStatisticsService = () => {
  const { get } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true, websiteVersion: 'v2' });

  const getStatistics = async (): Promise<IPublicWebsiteStatistics> => {
    const response = await get<IPublicWebsiteStatistics>(
      "/statistics",
      {},
      true
    );

    return response.data;
  };

  return {
    getStatistics,
  };
};
