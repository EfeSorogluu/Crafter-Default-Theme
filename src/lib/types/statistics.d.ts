export interface IEnrichedSignupPublic {
  id: string;
  username: string;
  timestamp: Date;
}

export interface IEnrichedPayment {
  id: string;
  username: string;
  amount: number;
  paymentMethod: string;
  timestamp: Date;
}

export interface IEnrichedPurchase {
  id: string;
  username: string;
  productName: string;
  serverName: string;
  amount: number;
  timestamp: Date;
}

export interface IEnrichedTopLoader {
  id: string;
  username: string;
  totalAmount: number;
}


export interface IPublicWebsiteStatistics {
  latest: {
    payments: IEnrichedPayment[];
    purchases: IEnrichedPurchase[];
    signups: IEnrichedSignupPublic[];
  };
  topCreditLoaders: IEnrichedTopLoader[];
  totalUsers: number;
}
