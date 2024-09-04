import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../constants/apiEndpoints';

interface UseFetchResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useFetch = <T>(endpoint: string, options?: AxiosRequestConfig): UseFetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...options?.headers,
                    ...(isAuthenticated ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
                },
            });
            setData(response.data);
        } catch (error) {
            setError('An error occurred while fetching data');
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, isAuthenticated, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
};