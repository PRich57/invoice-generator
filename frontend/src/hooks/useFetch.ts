import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from './useAuth';

interface UseFetchResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useFetch = <T>(url: string, options?: AxiosRequestConfig): UseFetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios(url, {
                ...options,
                headers: {
                    ...options?.headers,
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
            });
            setData(response.data);
        } catch (error) {
            setError('An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    }, [url, token, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
};