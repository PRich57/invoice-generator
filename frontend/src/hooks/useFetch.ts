import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from './useAuth';

interface UseFetchResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}

export const useFetch = <T>(url: string, options?: AxiosRequestConfig): UseFetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios(url, {
                    ...options,
                    headers: {
                        ...options?.headers,
                        Authorization: `Bearer ${token}`,
                    },
                });
                setData(response.data);
            } catch (error) {
                setError('An error occurred while fetching data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [url, token]);

    return { data, isLoading, error };
};