import { useApi } from '@/lib/hooks/useApi';
import { BACKEND_URL_WITH_WEBSITE_ID } from '../constants/base';
import { 
  VoteProvider, 
  VoteResponse
} from '../types/vote';

export const useVoteService = () => {
  const { get, post } = useApi({ baseUrl: BACKEND_URL_WITH_WEBSITE_ID });

  // Oy gönder
  const sendVote = async (providerId: string): Promise<VoteResponse> => {
    const response = await post<VoteResponse>(
      '/config/vote-providers/vote',
      { providerId },
      {},
      true
    );
    return response.data;
  };

  // Mevcut vote provider'ları getir
  const getProviders = async (): Promise<VoteProvider[]> => {
    const response = await get<{ success: boolean; providers: VoteProvider[] }>(
      '/config/vote-providers',
      {},
      true
    );
    return response.data.providers;
  };

  // Tek bir provider'ı getir
  const getProvider = async (providerId: string): Promise<VoteProvider> => {
    const response = await get<VoteProvider>(
      `/config/vote-providers/${providerId}`,
      {},
      true
    );
    return response.data;
  };

  return {
    sendVote,
    getProviders,
    getProvider,
  };
};
