import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL } from "../constants/base";
import { ChestItem } from "../types/chest";
import {
  CheckPaymentData,
  InitiatePaymentData,
  InitiatePaymentResponse,
  PaymentProvider,
} from "../types/payment";

export const usePaymentService = () => {
  const { post, get } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true });
  const { post: postMain } = useApi({ baseUrl: BACKEND_URL });

  const getPaymentProviders = async (): Promise<PaymentProvider[]> => {
    const response = await get<PaymentProvider[]>(
      `/config/payment/public`,
      {},
      true
    );
    return response.data;
  };

  const initiatePayment = async (
    data: InitiatePaymentData
  ): Promise<InitiatePaymentResponse> => {
    const response = await postMain<InitiatePaymentResponse>(
      `/website/payment/initiate`,
      data,
      {},
      true
    );
    return response.data;
  };

  const checkPayment = async (
    data: CheckPaymentData
  ): Promise<{ success: boolean, status: "COMPLETED" | "FAILED" | "PENDING" }> => {
    const response = await postMain<{ success: boolean, status: "COMPLETED" | "FAILED" | "PENDING" }>(
      `/website/payment/check`,
      data,
      {},
      true
    );
    return response.data;
  };

  return {
    getPaymentProviders,
    initiatePayment,
    checkPayment
  };
};
