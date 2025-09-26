export interface VoteProvider {
  id: string;
  type: 'serversmc';
  secretKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  logo?: string; // Logo URL'si
}

export interface VoteResponse {
  status: boolean;
  message: string;
  canVoteAt?: string; // YYYY-MM-DD HH:mm:ss format
}

export interface VoteError {
  success: false;
  message: string;
  type: 'VOTE_COOLDOWN' | 'PROVIDER_NOT_FOUND' | 'WEBSITE_NOT_FOUND' | 'USER_NOT_FOUND';
  canVoteAt?: string;
}
