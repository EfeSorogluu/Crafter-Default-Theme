import { LOG_TYPES } from "../utils/types/logs";
import { PERMISSIONS } from "../utils/constants/permissions";
import { ServerConnectionType } from "../utils/constants/server";

// --- Subschema Types ---

export interface GoogleAnalytics {
  gaId: string;
}

export interface Slider {
  id: string;
  text: string;
  description: string;
  image: string;
  route: string;
  buttonText: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discord {
  webhook_url: string | false;
  guild_id: string;
  webhook_events: LOG_TYPES[];
}

export interface Chest {
  id: string;
  product: Product;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  chest: Chest[];
  balance: number;
  access_token: string | null;
  refresh_token: string | null;
  isOwner?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: PERMISSIONS[];
  modifiable: boolean;
  default: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Authme {
  host: string;
  port: number;
  database: string;
  table: string;
  username: string;
  password: string;
}

export interface ServerConnection {
  type: ServerConnectionType;
  port: string;
  password: number;
}

export interface Server {
  id: string;
  name: string;
  ip: string;
  port: number;
  image: string;
  connection: ServerConnection;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  server_id: string | null;
  server_command: string | null;
  tags: string[];
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string | null;
  server_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProviderConfig {
  id: string;
  provider: "PayTR" | "Shopier" | "Papara" | "İyzico";
  name: string;
  isActive: boolean;
  config: Record<string, any>;
  priority: number;
  supportedCurrencies: string[];
  minAmount: number;
  maxAmount: number;
  description?: string;
  additionalSettings?: Record<string, any>;
}

export interface Payment {
  id: string;
  providerId: string;
  providerName: string;
  paymentName: string;
  merchant_oid: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELED" | "REFUNDED";
  basket: {
    name: string;
    price: string;
    quantity: number;
  }[];
  user: {
    user_id?: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  userIp: string;
  paymentProviderResponse?: any;
  callbackData?: any;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  type: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warning {
  id: string;
  userId: string;
  reason: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Logs {
  id: string;
  type: LOG_TYPES;
  category: string;
  performedBy: string;
  performedByUsername?: string;
  timestamp: Date;
  eventData: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: "info" | "warning" | "error" | "success";
  message: string;
  description?: string;
  metadata?: Record<string, any>;
  isSystemGenerated: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  tags?: string[];
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RedeemCode {
  id: string;
  code: string;
  reward: string;
  usageLimit: number;
  usedCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  userId: string;
  categoryId: string;
  status: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HelpCenter {
  categories: any[];
  items: any[];
  faqs: any[];
}

export interface Forum {
  categories: any[];
}

export interface ServerInfo {
  version: string | null;
  game: string | null;
  needs_original_minecraft: boolean | null;
}

export interface Security {
  maxRegistrationPerIp?: number;
  allowRegistration?: boolean;
  cf_turnstile?: {
    site_key: string;
    secret_key: string;
  };
  [key: string]: any;
}

export interface Theme {
  header: {
    bannerImage: string;
  };
  navbar: {
    label: string;
    url: string;
    icon: string;
    index: number;
  }[];
}

// --- Main Website Interface ---

export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  social_media: {
    instagram: string;
    tiktok: string;
    github: string;
    twitter: string;
    youtube: string;
    discord: string;
  };
  legal_documents: {
    rules: Record<string, any>;
    privacy_policy: Record<string, any>;
    terms_of_service: Record<string, any>;
  };
  currency: string;
  favicon: string;
  image: string;
  keywords: string[];
  google_analytics: GoogleAnalytics | null;
  sliders: Slider[];
  discord: Discord | null;
  users: User[];
  roles: Role[];
  authme: Authme | null;
  servers: Server[];
  products: Product[];
  categories: Category[];
  payment_providers: PaymentProviderConfig[];
  payments: Payment[];
  license_key: string;
  broadcast_items: string[];
  reports: Report[];
  warnings: Warning[];
  logs: Logs[];
  coupons: Coupon[];
  redeemCodes: RedeemCode[];
  posts: Post[];
  tickets: Ticket[];
  ticketCategories: TicketCategory[];
  helpCenter: HelpCenter;
  forum: Forum;
  security: Security;
  server_info: ServerInfo | null;
  theme: Theme;
  maintenance: boolean;
  tawkto: {
    isActive: boolean;
    propertyId: string;
    chatId: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
