import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';

export const useErrorHandler = () => {
    const [error, setError] = useState<string | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const handleError = useCallback((error: unknown) => {
        let errorMessage: string;

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error instanceof Error) {
            console.log("ERROR OBJECT:", error)
            errorMessage = error.message;
        } else {
            errorMessage = 'An unexpected error occurred';
        }

        setError(errorMessage);
        enqueueSnackbar(errorMessage, { 
            variant: 'error',
            autoHideDuration: 5000,
        });
    }, [enqueueSnackbar]);

    return { error, setError, handleError };
};