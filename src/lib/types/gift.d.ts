export interface GiftItem {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    username: string;
    email?: string;
  };
  receiver?: {
    id: string;
    username: string;
    email?: string;
  };
}

export interface SendGiftRequest {
  targetUserId: string;
  amount: number;
  message?: string;
}

export interface SendGiftResponse {
  success: boolean;
  message: string;
  gift?: GiftItem;
}
