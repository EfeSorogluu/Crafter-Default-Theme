import { useApi } from '@/lib/hooks/useApi';
import { BACKEND_URL } from '../constants/base';
import { User } from '../types/user';

export interface SignInRequest {
    username: string;
    password: string;
    turnstileToken?: string;
}

export interface SignInResponse {
    accessToken: string;
    refreshToken: string;
}

export interface SignUpRequest {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    turnstileToken?: string;
}

export interface SignUpResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ForgotPasswordRequest {
    email: string;
    turnstileToken?: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface ResetPasswordRequest {
    token: string;
    new_password: string;
    confirm_password: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

export const useAuthService = () => {
    const { post, get } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true, websiteVersion: 'v2' });

    const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
        const response = await post<SignInResponse>('/auth/signin', data);
        return response.data;
    };

    const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
        const response = await post<SignUpResponse>('/auth/signup', data);
        return response.data;
    };

    const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
        const response = await post<ForgotPasswordResponse>('/auth/forgot-password', data);
        return response.data;
    };

    const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
        const response = await post<ResetPasswordResponse>('/auth/reset-password', data);
        return response.data;
    };

    const getMe = async (): Promise<User> => {
        const response = await get<User>('/users/me', {}, true);
        return response.data;
    };

    return {
        signIn,
        signUp,
        forgotPassword,
        resetPassword,
        getMe
    };
};