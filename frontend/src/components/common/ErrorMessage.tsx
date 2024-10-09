import React from 'react';
import { Alert, AlertTitle, useTheme } from '@mui/material';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    const theme = useTheme();

    return (
        <Alert 
            severity="error" 
            sx={{ 
                backgroundColor: theme.palette.error.dark,
                color: theme.palette.error.contrastText,
            }}
        >
            <AlertTitle>Error</AlertTitle>
            {message}
        </Alert>
    );
};

export default ErrorMessage;