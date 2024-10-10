import React from 'react';
import { Box, Pagination as MuiPagination, Select, MenuItem } from '@mui/material';

interface PaginationProps {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    page,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <MuiPagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => onPageChange(newPage)}
                color="primary"
            />
            <Box display="flex" alignItems="center">
                <span>Items per page:</span>
                <Select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    size="small"
                    sx={{ ml: 1 }}
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