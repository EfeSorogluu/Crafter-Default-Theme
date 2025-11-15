import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL } from "../constants/base";

/**
 * @description Legal dokümanların veri yapısı.
 */
export interface LegalDocuments {
    rules: Record<string, any> | null;
    privacy_policy: Record<string, any> | null;
    terms_of_service: Record<string, any> | null;
}

/**
 * @description Legal dokümanları yönetmek için API hook'u.
 * @param websiteId - İşlem yapılacak web sitesinin kimliği.
 */
export const useLegalService = () => {
    const { get } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true });

    /**
     * @description Bir web sitesine ait legal dokümanları getirir.
     */
    const getLegalDocuments = async (): Promise<LegalDocuments> => {
        const response = await get<LegalDocuments>("/config/legal", {}, true);
        return response.data;
    };

    return {
        getLegalDocuments
    };
};