import { useApi } from '@/lib/hooks/useApi';
import { User, WallMessage } from '../types/user';
import { BACKEND_URL } from '../constants/base';

export const useUserService = () => {
    const { get, post, put } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true, websiteVersion: 'v2' });

    // Tüm kullanıcıları getir
    const getUsers = async (): Promise<User[]> => {
        const response = await get<User[]>(`/users`);
        return response.data;
    };

    // Tek bir kullanıcıyı getir (id veya 'me')
    const getUserById = async (userId: string): Promise<User> => {
        const response = await get<User>(`/users/${userId}`);
        return response.data;
    };

    // Kullanıcıyı güncelle
    const updateUser = async (
        userId: string,
        update: {
            email: string;
            password?: string;
        }
    ): Promise<User> => {
        const response = await put<User>(`/users/${userId}`, update);
        return response.data;
    };

    // Kullanıcı rolünü güncelle
    const updateUserRole = async (userId: string, role: string): Promise<User> => {
        const response = await put<User>(`/users/${userId}/role`, { role });
        return response.data;
    };

    // Kullanıcıya bakiye ekle
    const addBalance = async (userId: string, balance: number): Promise<User> => {
        const response = await put<User>(`/users/${userId}/balance`, { balance });
        return response.data;
    };

    // Kullanıcıyı banla
    const banUser = async (userId: string, banReason: string): Promise<User> => {
        const response = await post<User>(`/users/${userId}/ban`, { banReason });
        return response.data;
    };

    // Kullanıcı banını kaldır
    const unbanUser = async (userId: string): Promise<User> => {
        const response = await post<User>(`/users/${userId}/unban`);
        return response.data;
    };

    const getWallMessages = async (userId: string): Promise<WallMessage[]> => {
        const response = await get<WallMessage[]>(`/users/${userId}/wall`,);
        return response.data;
    };

    const sendWallMessage = async (userId: string, wallMessageId: string, content: string): Promise<User> => {
        const response = await post<User>(`/users/${userId}/wall`, { content });
        return response.data;
    };

    const replyWallMessage = async (userId: string, wallMessageId: string, content: string): Promise<User> => {
        const response = await post<User>(`/users/${userId}/wall/${wallMessageId}/reply`, { content });
        return response.data;
    };

    // Şifre değiştir
    const changePassword = async (
        userId: string,
        data: {
            currentPassword: string;
            newPassword: string;
        }
    ): Promise<User> => {
        const response = await post<User>(`/users/${userId}/change-password`, data);
        return response.data;
    };

    return {
        getUsers,
        getUserById,
        updateUser,
        updateUserRole,
        addBalance,
        banUser,
        unbanUser,
        getWallMessages,
        sendWallMessage,
        replyWallMessage,
        changePassword
    };
}; 