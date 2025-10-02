import { useApi } from "@/lib/hooks/useApi";
import {
  Punishment,
  SearchPunishmentsParams,
  GetPunishmentsParams,
  PaginatedResponse,
} from "../types/punishment";
import { BACKEND_URL_WITH_WEBSITE_ID } from "../constants/base";

export const usePunishmentService = () => {
  const { get } = useApi({ baseUrl: BACKEND_URL_WITH_WEBSITE_ID });

  // Punishments'ları ara
  const searchPunishments = async (
    params: SearchPunishmentsParams
  ): Promise<PaginatedResponse<Punishment>> => {
    const queryParams = new URLSearchParams();

    queryParams.append("query", params.query);
    if (params.type) queryParams.append("type", params.type);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await get<PaginatedResponse<Punishment>>(
      `/config/punishments/search?${queryParams.toString()}`
    );
    return response.data;
  };

  // Punishments'ları getir
  const getPunishments = async (
    params?: GetPunishmentsParams
  ): Promise<PaginatedResponse<Punishment>> => {
    const queryParams = new URLSearchParams();

    if (params?.type) queryParams.append("type", params.type);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/config/punishments${queryString ? `?${queryString}` : ""}`;

    const response = await get<PaginatedResponse<Punishment>>(url);
    return response.data;
  };

  // Belirli bir tipteki punishments'ları getir
  const getPunishmentsByType = async (
    type: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<Punishment>> => {
    return getPunishments({
      type,
      page,
      limit,
    });
  };

  // Aktif punishments'ları getir
  const getActivePunishments = async (
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<Punishment>> => {
    return getPunishments({
      page,
      limit,
    });
  };

  // Belirli bir oyuncunun punishments'larını ara
  const searchPlayerPunishments = async (
    playerName: string,
    type?: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<Punishment>> => {
    return searchPunishments({
      query: playerName,
      type,
      page,
      limit,
    });
  };

  return {
    searchPunishments,
    getPunishments,
    getPunishmentsByType,
    getActivePunishments,
    searchPlayerPunishments,
  };
};
