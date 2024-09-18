import { useState } from 'react';
import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';


export const useErrorHandler = () => {
    const [error, setError] = useState<string | null>(null);

    const handleError = (error: unknown) => {
        let errorMessage: string;

        if (axios.isAxiosError(error)) {
            // The error is an AxiosError
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                const statusCode = error.response.status;

                if (error.response.data && error.response.data.detail) {
                    // Extract the detail message from the response
                    errorMessage = error.response.data.detail;
                } else {
                    // Fallback to status text
                    errorMessage = error.response.statusText || 'An error occurred';
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'No response received from the server';
            } else {
                // Something happened in setting up the request
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = 'An unexpected error occurred';
        }

        setError(errorMessage);
        toast.error(errorMessage, {
            position: 'bottom-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    return { error, setError, handleError };
};
