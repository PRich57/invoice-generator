import { useState, useCallback } from 'react';
import api from '../services/api';
import { AxiosRequestConfig } from 'axios';
import { useErrorHandler } from './useErrorHandler';

interface UseFetchResult<T> {
    data: T | null;
    isLoading: boolean;
    refetch: () => Promise<T | null>;
    fetchData: (customOptions?: AxiosRequestConfig) => Promise<T | null>;
}

export const useFetch = <T>(
    endpoint: string | null,
    options?: AxiosRequestConfig
): UseFetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { handleError } = useErrorHandler();

    const fetchData = useCallback(async (customOptions?: AxiosRequestConfig) => {
        if (!endpoint) {
            return null;
        }

        setIsLoading(true);
        try {
            const response = await api({
                url: endpoint,
                method: options?.method || 'GET',
                ...options,
                ...customOptions,
            });
            setData(response.data);
            return response.data;
        } catch (error) {
            handleError(error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, options, handleError]);

    return { data, isLoading, refetch: fetchData, fetchData };
};