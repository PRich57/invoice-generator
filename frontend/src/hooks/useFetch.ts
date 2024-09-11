import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from './useAuth';
import { useCallback, useEffect, useState } from 'react';

interface UseFetchResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<T | null>;
    fetchData: (customOptions?: AxiosRequestConfig) => Promise<T | null>;
}

export const useFetch = <T>(endpoint: string | null, options?: AxiosRequestConfig): UseFetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    const fetchData = useCallback(async (customOptions?: AxiosRequestConfig) => {
        if (!endpoint) {
            return null;
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await axios({
                url: endpoint,
                method: options?.method || 'GET',
                ...options,
                ...customOptions,
                headers: {
                    ...options?.headers,
                    ...customOptions?.headers,
                    ...(isAuthenticated ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
                },
            });
            setData(response.data);
            return response.data;
        } catch (error) {
            setError('An error occurred while fetching data');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, options, isAuthenticated]);

    useEffect(() => {
        if (endpoint && options?.method === 'GET') {
            fetchData();
        }
    }, [endpoint, options?.method, fetchData]);

    return { data, isLoading, error, refetch: fetchData, fetchData };
};