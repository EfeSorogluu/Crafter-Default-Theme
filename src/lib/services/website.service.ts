import { serverApi } from "@/lib/api/serverApi";
import { Website } from "../types/website";
import { License } from "../types/license";

export interface CreateWebsiteRequest {
  name: string;
  description: string;
  url: string;
  image: string;
}

export interface GetWebsiteRequest {
  id?: string;
  url?: string;
}

export interface VerifyLicenseKeyRequest {
  key: string;
}

export interface VerifyLicenseKeyResponse {
  success: boolean;
  message: string;
  website: Website;
  license: License;
}

export interface RedeemCodeRequest {
  code: string;
}

export interface RedeemCodeResponse {
  success: boolean;
  message: string;
  bonus?: number;
  product?: any; // Ürün tipi daha sonra detaylandırılabilir
}

export const serverWebsiteService = () => {
  const createWebsite = async (
    data: CreateWebsiteRequest
  ): Promise<Website> => {
    const response = await serverApi.post<Website>("/website/create", data);
    return response.data;
  };

  const verifyLicenseKey = async (
    data: VerifyLicenseKeyRequest
  ): Promise<VerifyLicenseKeyResponse> => {
    const response = await serverApi.post<VerifyLicenseKeyResponse>(
      "/website/key/verify",
      data
    );
    return response.data;
  };

  /**
   * @deprecated Use getWebsiteById instead.
   */
  const getWebsite = async (data: GetWebsiteRequest): Promise<Website> => {
    const response = await serverApi.post<Website>("/website/get", data);
    return response.data;
  };

  const getWebsiteById = async (websiteId: string): Promise<Website> => {
    const response = await serverApi.get<Website>(`/website/${websiteId}`);
    return response.data;
  };

  return {
    createWebsite,
    verifyLicenseKey,
    getWebsite,
    getWebsiteById,
  };
};
