import { useApi } from "@/lib/hooks/useApi";
import { BACKEND_URL } from "../constants/base";

export interface ForumCategory {
    id: string;
    name: string;
    description?: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    topics: ForumTopic[];
    subCategories: ForumCategory[];
}

export interface ForumTopic {
    id: string;
    title: string;
    slug: string;
    content: Record<string, any>; // Lexical rich text JSON data
    authorId: string;
    authorName: string;
    messages: ForumMessage[];
    viewCount: number;
    replyCount: number;
    likeCount: number;
    likedBy?: string[];
    isPinned: boolean;
    isLocked: boolean;
    repliesLocked: boolean;
    isDeleted: boolean;
    isPublished: boolean;
    moderationStatus: 'pending' | 'approved' | 'rejected';
    moderationNote?: string;
    createdAt: string;
    updatedAt: string;
    categoryId?: string;
}

export interface ForumMessage {
    id: string;
    authorId: string;
    authorName: string;
    content: Record<string, any>; // Lexical rich text JSON data
    likeCount: number;
    likedBy?: string[];
    isDeleted: boolean;
    deletedAt?: string;
    deletedBy?: string;
    replies: ForumMessageReply[];
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ForumMessageReply {
    id: string;
    authorId: string;
    authorName: string;
    content: Record<string, any>; // Lexical rich text JSON data
    createdAt: string;
    updatedAt: string;
    viewCount: number;
}

export interface ForumStatistics {
    lastTopics: ForumTopic[];
    lastMessages: ForumMessage[];
    topMessageUsers: Array<{
        userId: string;
        username: string;
        count: number;
    }>;
}

export interface CreateForumTopicDto {
    title: string;
    content: Record<string, any>; // Lexical rich text JSON data
}

export interface CreateForumMessageDto {
    content: Record<string, any>; // Lexical rich text JSON data
}

export interface CreateForumReplyDto {
    content: Record<string, any>; // Lexical rich text JSON data
}

export const useWebsiteForumService = () => {
    const { get, post, delete: del } = useApi({
        baseUrl: BACKEND_URL,
        useWebsiteId: true,
    });

    // Forum data operations
    const getForumStatistics = async (data: { websiteId: string }): Promise<ForumStatistics> => {
        const response = await get<ForumStatistics>(`/forum/statistics`, {}, true);
        return response.data;
    };

    const getAllCategories = async (data: { websiteId: string }): Promise<ForumCategory[]> => {
        const response = await get<ForumCategory[]>(`/forum/categories`, {}, true);
        return response.data;
    };

    const getCategoryById = async (data: { websiteId: string; categoryIdOrSlug: string }): Promise<ForumCategory> => {
        const response = await get<ForumCategory>(`/forum/category/${data.categoryIdOrSlug}`, {}, true);
        return response.data;
    };

    const getTopicsByCategoryId = async (data: { websiteId: string; categoryIdOrSlug: string }): Promise<ForumTopic[]> => {
        const response = await get<ForumTopic[]>(`/forum/category/${data.categoryIdOrSlug}/topics`, {}, true);
        return response.data;
    };

    const getTopicById = async (data: { websiteId: string; topicIdOrSlug: string }): Promise<ForumTopic> => {
        const response = await get<ForumTopic>(`/forum/topic/${data.topicIdOrSlug}`, {}, true);
        return response.data;
    };

    // Topic operations (requires authentication)
    const createTopic = async (data: {
        websiteId: string;
        categoryIdOrSlug: string;
        topic: CreateForumTopicDto;
    }): Promise<ForumTopic> => {
        const response = await post<ForumTopic>(`/forum/category/${data.categoryIdOrSlug}/topic`, data.topic, {}, true);
        return response.data;
    };

    // Message operations (requires authentication)
    const createMessage = async (data: {
        websiteId: string;
        topicId: string;
        message: CreateForumMessageDto;
    }): Promise<ForumMessage> => {
        const response = await post<ForumMessage>(`/forum/topic/${data.topicId}/message`, data.message, {}, true);
        return response.data;
    };

    // Reply operations (requires authentication)
    const createReply = async (data: {
        websiteId: string;
        messageId: string;
        reply: CreateForumReplyDto;
    }): Promise<ForumMessageReply> => {
        const response = await post<ForumMessageReply>(`/forum/message/${data.messageId}/reply`, data.reply, {}, true);
        return response.data;
    };

    // Topic like/unlike operations (requires authentication)
    const likeTopic = async (data: { websiteId: string; topicId: string }): Promise<{ success: boolean; likeCount: number; message: string }> => {
        const response = await post<{ success: boolean; likeCount: number; message: string }>(`/forum/topic/${data.topicId}/like`, {}, {}, true);
        return response.data;
    };

    const unlikeTopic = async (data: { websiteId: string; topicId: string }): Promise<{ success: boolean; likeCount: number; message: string }> => {
        const response = await del<{ success: boolean; likeCount: number; message: string }>(`/forum/topic/${data.topicId}/like`, {}, true);
        return response.data;
    };

    // Message like/unlike operations (requires authentication)
    const likeMessage = async (data: { websiteId: string; messageId: string }): Promise<{ success: boolean; likeCount: number; message: string }> => {
        const response = await post<{ success: boolean; likeCount: number; message: string }>(`/forum/message/${data.messageId}/like`, {}, {}, true);
        return response.data;
    };

    const unlikeMessage = async (data: { websiteId: string; messageId: string }): Promise<{ success: boolean; likeCount: number; message: string }> => {
        const response = await del<{ success: boolean; likeCount: number; message: string }>(`/forum/message/${data.messageId}/like`, {}, true);
        return response.data;
    };

    return {
        // Public read operations
        getForumStatistics,
        getAllCategories,
        getCategoryById,
        getTopicsByCategoryId,
        getTopicById,

        // Authenticated write operations
        createTopic,
        createMessage,
        createReply,

        // Topic like/unlike operations
        likeTopic,
        unlikeTopic,

        // Message like/unlike operations
        likeMessage,
        unlikeMessage,
    };
}; 