import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL } from "../constants/base";

export interface HelpCenterCategory {
    id: string;
    name: string;
    description?: string;
    icon: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface HelpCenterItem {
    id: string;
    title: string;
    content: Record<string, any>; // Lexical rich text JSON data {root: xxx}
    categoryId: string;
    order: number;
    isActive: boolean;
    views: number;
    isFAQ: boolean;
    createdAt: string;
    updatedAt: string;
    category?: {
        id: string;
        name: string;
        description?: string;
        icon: string;
    };
}

export interface HelpCenterFAQ {
    id: string;
    question: Record<string, any>; // Lexical rich text JSON data {root: xxx}
    answer: Record<string, any>; // Lexical rich text JSON data {root: xxx}
    order: number;
    isActive: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
}

export interface HelpCenterData {
    categories: HelpCenterCategory[];
    items: HelpCenterItem[];
    faqs: HelpCenterFAQ[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface GetHelpCenterDto {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    activeOnly?: boolean;
    faqOnly?: boolean;
    sortBy?: string;
    sortOrder?: string;
}

export const useWebsiteHelpCenterService = () => {
    const { get } = useApi({
        baseUrl: BACKEND_URL,
        useWebsiteId: true,
    });

    // Help Center data operations
    const getHelpCenter = async (data: { websiteId: string; query?: GetHelpCenterDto }): Promise<HelpCenterData> => {
        const response = await get<HelpCenterData>(`/helpcenter`, { params: data.query || {} }, true);
        return response.data;
    };

    // Category operations
    const getCategory = async (data: { websiteId: string; categoryId: string }): Promise<HelpCenterCategory> => {
        const response = await get<HelpCenterCategory>(`/helpcenter/category/${data.categoryId}`, {}, true);
        return response.data;
    };

    // Item operations
    const getItem = async (data: { websiteId: string; itemId: string }): Promise<HelpCenterItem> => {
        const response = await get<HelpCenterItem>(`/helpcenter/item/${data.itemId}`, {}, true);
        return response.data;
    };

    // FAQ operations
    const getFAQ = async (data: { websiteId: string; faqId: string }): Promise<HelpCenterFAQ> => {
        const response = await get<HelpCenterFAQ>(`/helpcenter/faq/${data.faqId}`, {}, true);
        return response.data;
    };

    return {
        // Help Center data operations
        getHelpCenter,
        // Category operations
        getCategory,
        // Item operations
        getItem,
        // FAQ operations
        getFAQ,
    };
}; 