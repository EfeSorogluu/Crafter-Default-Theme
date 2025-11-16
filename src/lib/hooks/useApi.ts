"use client"

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTH_ROUTES } from '../constants/routes';
import { ErrorMessages, ErrorType } from '../constants/errors';
import { BACKEND_URL } from '../constants/base';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ValidationError {
  message: string[];
  error: string;
  statusCode: number;
}

interface CustomError {
  success: boolean;
  message: string;
  type: ErrorType;
}

interface ApiError {
  message: string | string[];
  status: number;
  type?: ErrorType;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

type ErrorResponse = ValidationError | CustomError | { message: string };

export const useApi = ({
  baseUrl = BACKEND_URL,
  headers = {
    'Content-Type': 'application/json'
  },
  useWebsiteId = false,
  websiteVersion = 'v1'
}: {
  baseUrl?: string;
  headers?: Record<string, string>;
  useWebsiteId?: boolean;
  websiteVersion?: 'v1' | 'v2';
}) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTokenQueue = useRef<(() => void)[]>([]);
  
  // Website ID'yi direkt localStorage'dan al
  const websiteId = useWebsiteId && typeof window !== 'undefined' 
    ? localStorage.getItem('websiteId') 
    : null;

  const finalBaseUrl = useWebsiteId && websiteId 
    ? `${BACKEND_URL}/website/${websiteVersion === 'v2' ? 'v2/' : ''}${websiteId}`
    : baseUrl;

  const api = useRef<AxiosInstance>(
    axios.create({
      baseURL: finalBaseUrl,
      headers: headers,
    })
  );

  useEffect(() => {
    api.current.defaults.baseURL = finalBaseUrl;
  }, [finalBaseUrl]);

  const processQueue = (error: AxiosError | null = null) => {
    refreshTokenQueue.current.forEach((prom) => {
      if (error) {
        prom();
      } else {
        prom();
      }
    });
    refreshTokenQueue.current = [];
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<RefreshTokenResponse>(
        `${BACKEND_URL}/auth/refresh-token`,
        { refresh_token: refreshToken }
      );

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return true;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      return false;
    }
  };

  const handleError = (error: AxiosError<ErrorResponse>): never => {
    const response = error.response?.data;

    if (!response) {
      throw {
        message: 'An error occurred',
        status: error.response?.status || 500,
      };
    }

    // Handle validation errors
    if (error.response?.status === 400 && Array.isArray(response.message)) {
      const validationError = response as ValidationError;
      throw {
        message: validationError.message,
        status: validationError.statusCode,
      };
    }

    // Handle custom error types
    if ('type' in response && response.type && Object.values(ErrorType).includes(response.type)) {
      const customError = response as CustomError;
      throw {
        message: ErrorMessages[response.type] || customError.message,
        status: error.response?.status || 500,
        type: response.type,
      };
    }

    // Handle other errors
    throw {
      message: response.message || 'An error occurred',
      status: error.response?.status || 500,
    };
  };

  useEffect(() => {
    const requestInterceptor = api.current.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.current.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve) => {
              refreshTokenQueue.current.push(() => {
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                };
                resolve(api.current(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          setIsRefreshing(true);

          try {
            const success = await refreshToken();
            if (success) {
              processQueue();
              return api.current(originalRequest);
            }
          } catch (refreshError) {
            processQueue(refreshError as AxiosError);
            return Promise.reject(refreshError);
          } finally {
            setIsRefreshing(false);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.current.interceptors.request.eject(requestInterceptor);
      api.current.interceptors.response.eject(responseInterceptor);
    };
  }, [router]);

  const request = useCallback(
    async <T>(config: AxiosRequestConfig, authorize = true): Promise<ApiResponse<T>> => {
      try {
        // Website ID gerekiyorsa ve henüz yüklenmediyse hata fırlat
        if (useWebsiteId && !websiteId) {
          throw new Error('Website ID is required but not available yet');
        }

        if (authorize) {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${token}`
            };
          }
        }

        const response: AxiosResponse<T> = await api.current(config);
        return {
          data: response.data,
          status: response.status,
        };
      } catch (error) {
        handleError(error as AxiosError<ErrorResponse>);
        throw error;
      }
    },
    [useWebsiteId, websiteId]
  );

  return {
    get: <T>(url: string, config?: AxiosRequestConfig, authorize = true) =>
      request<T>({ ...config, method: 'GET', url }, authorize),
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig, authorize = true) =>
      request<T>({ ...config, method: 'POST', url, data }, authorize),
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig, authorize = true) =>
      request<T>({ ...config, method: 'PUT', url, data }, authorize),
    delete: <T>(url: string, config?: AxiosRequestConfig, authorize = true) =>
      request<T>({ ...config, method: 'DELETE', url }, authorize),
    isReady: !useWebsiteId || !!websiteId, // API hazır mı?
  };
};
