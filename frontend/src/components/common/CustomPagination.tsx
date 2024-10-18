import React from 'react';
import { Box, Pagination as MuiPagination, Select, MenuItem, Typography } from '@mui/material';

interface PaginationProps {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    isMobile: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    page,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    isMobile,
}) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    return (
        <Box 
            display="flex" 
            flexDirection={isMobile ? 'column' : 'row'} 
            alignItems="center" 
            justifyContent="space-between" 
            width="100%"
        >
            <Box mb={isMobile ? 1 : 0}>
                <MuiPagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => onPageChange(newPage)}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                />
            </Box>
            <Box display="flex" alignItems="center">
                <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ mr: 1 }}>
                    Items per page:
                </Typography>
                <Select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    size="small"
                    sx={{
                        mt: 2
                    }}
                >
                    {[10, 25, 50, 100].map((size) => (
                        <MenuItem key={size} value={size}>
                            {size}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        </Box>
    );
};

export default Pagination;