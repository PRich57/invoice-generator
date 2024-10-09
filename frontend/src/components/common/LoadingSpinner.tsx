import React from 'react';
import { CircularProgress, Box, useTheme } from '@mui/material';

interface LoadingSpinnerProps {
    size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40 }) => {
    const theme = useTheme();

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress size={size} sx={{ color: theme.palette.primary.main }} />
        </Box>
    );
};

export default LoadingSpinner;