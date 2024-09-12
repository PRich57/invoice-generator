import { useState } from 'react';
import { toast } from 'react-toastify';

export const useErrorHandler = () => {
    const [error, setError] = useState<string | null>(null);

    const handleError = (error: unknown) => {
        let errorMessage: string;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else {
            errorMessage = 'An unexpected error occurred';
        }
        setError(errorMessage);
        toast.error(errorMessage, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    return { error, setError, handleError };
};