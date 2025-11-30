// hooks/useApi.ts
import { useCallback, useState } from 'react';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from '@/storage';
import { router } from 'expo-router';

// Настройка axios instance
const api = axios.create({
    baseURL: process.env.API_BASE_URL || 'http://localhost:8010',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерфейсы
export interface ApiResponse<T = any> {
    data: T;
    status: number;
    message?: string;
}

export interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (config: AxiosRequestConfig) => Promise<any>;
    reset: () => void;
}

// Request interceptor для добавления токена
api.interceptors.request.use(
    config => {
        // Получаем токен из storage
        const token = storage.getString('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response?.status === 401) {
            // Токен истек или невалидный
            console.log('Unauthorized, redirect to login');

            // Очищаем токен
            storage.remove('access_token');
            storage.remove('refresh_token');
            storage.remove('user_id');
            storage.remove('user_email');

            // Редирект на логин
            router.replace('/login');
        }
        return Promise.reject(error);
    }
);

export const useApi = <T = any,>(): UseApiReturn<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async (config: AxiosRequestConfig) => {
        setLoading(true);
        setError(null);

        try {
            const response: AxiosResponse<T> = await api(config);
            setData(response.data);
            return response.data;
        } catch (err) {
            const axiosError = err as AxiosError;
            // @ts-ignore
            const errorMessage = axiosError.response?.data?.error || axiosError.message || 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    // @ts-ignore
    return { data, loading, error, execute, reset };
};
