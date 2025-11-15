import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { BACKEND_URL } from '../constants/base';
import { ErrorMessages, ErrorType } from '../constants/errors';

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

interface ErrorResponse {
  message: string | string[];
  status?: number;
  type?: ErrorType;
}

const api: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Origin': process.env.NEXT_PUBLIC_BASE_URL || ""
  },
});

const handleError = (error: AxiosError<ErrorResponse>) => {
  const response = error.response?.data;

  console.log('API Error Response:', response);

  if (!response) {
    throw {
      message: 'An error occurred',
      status: error.response?.status || 500,
    };
  }

  if (error.response?.status === 400 && Array.isArray(response.message)) {
    throw {
      message: response.message,
      status: error.response?.status || 400,
    };
  }

  if ('type' in response && response.type && Object.values(ErrorType).includes(response.type)) {
    throw {
      message: ErrorMessages[response.type] || response.message,
      status: error.response?.status || 500,
      type: response.type,
    };
  }

  throw {
    message: response.message || 'An error occurred',
    status: error.response?.status || 500,
  };
};

export const serverApi = {
  get: async <T>(url: string, config?: AxiosRequestConfig, token?: string): Promise<ApiResponse<T>> => {
    try {
      const headers = token
        ? { ...(config?.headers || {}), Authorization: `Bearer ${token}` }
        : config?.headers;

      const response = await api.get<T>(url, { ...config, headers });
      return { data: response.data, status: response.status };
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
      throw error;
    }
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig, token?: string): Promise<ApiResponse<T>> => {
    try {
      const headers = token
        ? { ...(config?.headers || {}), Authorization: `Bearer ${token}` }
        : config?.headers;

      const response = await api.post<T>(url, data, { ...config, headers });
      return { data: response.data, status: response.status };
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
      throw error;
    }
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig, token?: string): Promise<ApiResponse<T>> => {
    try {
      const headers = token
        ? { ...(config?.headers || {}), Authorization: `Bearer ${token}` }
        : config?.headers;

      const response = await api.put<T>(url, data, { ...config, headers });
      return { data: response.data, status: response.status };
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
      throw error;
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig, token?: string): Promise<ApiResponse<T>> => {
    try {
      const headers = token
        ? { ...(config?.headers || {}), Authorization: `Bearer ${token}` }
        : config?.headers;

      const response = await api.delete<T>(url, { ...config, headers });
      return { data: response.data, status: response.status };
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
      throw error;
    }
  },
};
