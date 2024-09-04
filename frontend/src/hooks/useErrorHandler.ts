import { useState, useCallback } from 'react';
import axios from 'axios';

export const useErrorHandler = () => {
    const [error, setError] = useState<string | null>(null);

    const handleError = useCallback((error: unknown) => {
        if (axios.isAxiosError(error)) {
            setError(error.response?.data?.message || 'An unexpected error occurred');
        } else if (error instanceof Error) {
            setError(error.message);
        } else {
            setError('An unexpected error occurred');
        }
    }, []);

    return { error, setError, handleError };
};