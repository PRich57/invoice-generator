import React from 'react';
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    SelectChangeEvent,
    Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { InvoiceFilters } from '../../types';

interface InvoiceFiltersComponentProps {
    filters: InvoiceFilters;
    onFilterChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => void;
    onDateChange: (field: 'date_from' | 'date_to', value: string | null) => void;
}

const InvoiceFiltersComponent: React.FC<InvoiceFiltersComponentProps> = ({
    filters,
    onFilterChange,
    onDateChange,
}) => {
    return (
        <Stack spacing={2}>
            <TextField
                fullWidth
                name="invoice_number"
                label="Invoice Number"
                value={filters.invoice_number || ''}
                onChange={onFilterChange}
            />
            <Box display='flex' flexDirection='row' gap={1}>
                <TextField
                    fullWidth
                    name="bill_to_name"
                    label="Bill To Name"
                    value={filters.bill_to_name || ''}
                    onChange={onFilterChange}
                />
                <TextField
                    fullWidth
                    name="send_to_name"
                    label="Send To Name"
                    value={filters.send_to_name || ''}
                    onChange={onFilterChange}
                />
            </Box>
            <Box display='flex' flexDirection='row' gap={1}>
                <FormControl fullWidth>
                    <InputLabel>Client Type</InputLabel>
                    <Select
                        name="client_type"
                        value={filters.client_type || ''}
                        onChange={onFilterChange}
                        label="Client Type"
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                        <MenuItem value="BUSINESS">Business</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Invoice Type</InputLabel>
                    <Select
                        name="invoice_type"
                        value={filters.invoice_type || ''}
                        onChange={onFilterChange}
                        label="Invoice Type"
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="SERVICE">Service</MenuItem>
                        <MenuItem value="PRODUCT">Product</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                    name="status"
                    value={filters.status || ''}
                    onChange={onFilterChange}
                    label="Status"
                >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="PAID">Paid</MenuItem>
                    <MenuItem value="UNPAID">Unpaid</MenuItem>
                    <MenuItem value="OVERDUE">Overdue</MenuItem>
                </Select>
            </FormControl>
            <Box display='flex' flexDirection='row' gap={1}>
                <TextField
                    fullWidth
                    name="total_min"
                    label="Min Total"
                    type="number"
                    value={filters.total_min || ''}
                    onChange={onFilterChange}
                />
                <TextField
                    fullWidth
                    name="total_max"
                    label="Max Total"
                    type="number"
                    value={filters.total_max || ''}
                    onChange={onFilterChange}
                />
            </Box>
            <Box display='flex' flexDirection='row' gap={1} width='100%'>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="From Date"
                        value={filters.date_from ? dayjs(filters.date_from) : null}
                        onChange={(newValue) => onDateChange('date_from', newValue ? newValue.format('YYYY-MM-DD') : null)}
                        sx={{ width: '50%' }}
                    />
                    <DatePicker
                        label="To Date"
                        value={filters.date_to ? dayjs(filters.date_to) : null}
                        onChange={(newValue) => onDateChange('date_to', newValue ? newValue.format('YYYY-MM-DD') : null)}
                        sx={{ width: '50%' }}
                    />
                </LocalizationProvider>
            </Box>
        </Stack>
    );
};

export default InvoiceFiltersComponent;