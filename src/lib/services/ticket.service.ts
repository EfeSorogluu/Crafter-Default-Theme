import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL } from "../constants/base";

export interface TicketMessage {
  senderId: string;
  content: Record<string, any>; // Lexical rich text JSON data {root: xxx}
  sender?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface Ticket {
  id: string;
  title: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  messages: TicketMessage[];
  status: 'CLOSED' | 'REPLIED' | 'OPEN' | 'ON_OPERATE';
  assignedUserIds: string[];
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    id: string;
    username: string;
    email: string;
  };
  assignedUsers?: Array<{
    id: string;
    username: string;
    email: string;
  }>;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDto {
  title: string;
  categoryId: string;
  message: Record<string, any>; // Lexical JSON {root: ...}
}

export interface ReplyTicketDto {
  message: Record<string, any>; // Lexical JSON {root: ...}
}

export const useWebsiteTicketService = () => {
  const { get, post } = useApi({
    baseUrl: BACKEND_URL,
    useWebsiteId: true,
    websiteVersion: 'v2'
  });

  // Ticket operations
  const getTickets = async (): Promise<Ticket[]> => {
    const response = await get<Ticket[]>(`/tickets`, {}, true);
    return response.data;
  };

  const getTicket = async (data: { ticketId: string }): Promise<Ticket> => {
    const response = await get<Ticket>(`/tickets/${data.ticketId}`, {}, true);
    return response.data;
  };

  const createTicket = async (data: { ticket: CreateTicketDto }): Promise<Ticket> => {
    const response = await post<Ticket>(`/tickets`, data.ticket, {}, true);
    return response.data;
  };

  const replyToTicket = async (data: { ticketId: string; reply: ReplyTicketDto }): Promise<Ticket> => {
    const response = await post<Ticket>(`/tickets/${data.ticketId}/reply`, data.reply, {}, true);
    return response.data;
  };

  const getTicketCategories = async (): Promise<TicketCategory[]> => {
    const response = await get<TicketCategory[]>(`/tickets/categories`, {}, true);
    return response.data;
  };

  const getTicketCategory = async (data: { categoryId: string }): Promise<TicketCategory> => {
    const response = await get<TicketCategory>(`/tickets/categories/${data.categoryId}`, {}, true);
    return response.data;
  };

  return {
    // Ticket operations
    getTickets,
    getTicket,
    createTicket,
    replyToTicket,
    // Ticket category operations
    getTicketCategories,
    getTicketCategory
  };
}; 