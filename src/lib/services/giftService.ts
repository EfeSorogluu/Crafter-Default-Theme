import { useApi } from "@/lib/hooks/useApi";
import { GiftItem, SendGiftRequest, SendGiftResponse } from "@/lib/types/gift";

// Gift service following the same pattern as ChestService 
export class GiftService {
  private api: ReturnType<typeof useApi>;

  constructor() {
    this.api = useApi({ websiteVersion: "v2" }); // Using v2 like the backend controller
  }

  // TODO: Bu method henüz eklenmedi - Backend'de implement edilmeli
  /**
   * Get all gifts sent by a user
   * @param userId - User ID or "me"
   */
  async getSentGifts(userId: string): Promise<GiftItem[]> {
    const response = await this.api.get<GiftItem[]>(
      `/users/${userId}/gifts/sent`,
      {},
      true
    );
    return response.data;
  }

  // TODO: Bu method henüz eklenmedi - Backend'de implement edilmeli
  /**
   * Get all gifts received by a user
   * @param userId - User ID or "me"
   */
  async getReceivedGifts(userId: string): Promise<GiftItem[]> {
    const response = await this.api.get<GiftItem[]>(
      `/users/${userId}/gifts/received`,
      {},
      true
    );
    return response.data;
  }

  /**
   * Send balance as a gift to another user
   * Uses the same endpoint as balance transfer in the backend
   * @param userId - Sender user ID or "me"
   * @param giftData - Gift data including targetUserId and amount
   */
  async sendGift(
    userId: string,
    giftData: SendGiftRequest
  ): Promise<SendGiftResponse> {
    const response = await this.api.post<SendGiftResponse>(
      `/users/${userId}/balance/send`,
      {
        targetUserId: giftData.targetUserId,
        amount: giftData.amount,
      },
      {},
      true
    );

    return response.data;
  }

  // TODO: Bu method henüz eklenmedi - Backend'de implement edilmeli
  /**
   * Get gift details by ID
   * @param userId - User ID or "me"
   * @param giftId - Gift ID
   */
  async getGiftById(userId: string, giftId: string): Promise<GiftItem> {
    const response = await this.api.get<GiftItem>(
      `/users/${userId}/gifts/${giftId}`,
      {},
      true
    );
    return response.data;
  }

  // TODO: Bu method henüz eklenmedi - Backend'de implement edilmeli
  /**
   * Accept a received gift
   * @param userId - User ID or "me"
   * @param giftId - Gift ID
   */
  async acceptGift(
    userId: string,
    giftId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post<{
      success: boolean;
      message: string;
    }>(`/users/${userId}/gifts/${giftId}/accept`, {}, {}, true);

    return response.data;
  }

  // TODO: Bu method henüz eklenmedi - Backend'de implement edilmeli
  /**
   * Reject a received gift
   * @param userId - User ID or "me"
   * @param giftId - Gift ID
   */
  async rejectGift(
    userId: string,
    giftId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post<{
      success: boolean;
      message: string;
    }>(`/users/${userId}/gifts/${giftId}/reject`, {}, {}, true);

    return response.data;
  }
}

// Client-side instance
export const giftService = () => new GiftService();

// For server-side usage
export const serverGiftService = () => new GiftService();
