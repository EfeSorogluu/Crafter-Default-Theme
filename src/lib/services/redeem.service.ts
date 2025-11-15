import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL } from "../constants/base";

export interface RedeemCodeResponse {
    success: boolean;
    message: string;
    bonus?: number;
    products?: { id: string; name: string }[];
}

export const useRedeemService = () => {
    const { post } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true });

    const redeemCode = async (
        code: string
    ): Promise<RedeemCodeResponse> => {
        const response = await post<RedeemCodeResponse>(
            `/redeem-codes/use`,
            { code },
            {},
            true
        );
        return response.data;
    };

    return {
        redeemCode,
    };
}; 