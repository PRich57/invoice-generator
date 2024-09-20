import { useState } from 'react';
import { useSnackbar } from 'notistack';

export const useErrorHandler = () => {
    const [error, setError] = useState<string | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const handleError = (error: unknown) => {
        let errorMessage: string;

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = 'An unexpected error occurred';
        }

        setError(errorMessage);
        enqueueSnackbar(errorMessage, { 
            variant: 'error',
            autoHideDuration: 5000,
        });
    };

    return { error, setError, handleError };
};