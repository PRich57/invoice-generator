import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    SelectChangeEvent,
    Chip,
    Box,
} from '@mui/material';

const groupOptions = [
    { value: 'bill_to', label: 'Bill To' },
    { value: 'send_to', label: 'Send To' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'status', label: 'Status' },
    { value: 'client_type', label: 'Client Type' },
    { value: 'invoice_type', label: 'Invoice Type' },
];

interface InvoiceGroupByProps {
    groupBy: string[];
    onGroupChange: (event: SelectChangeEvent<string[]>) => void;
}

const InvoiceGroupBy: React.FC<InvoiceGroupByProps> = ({ groupBy, onGroupChange }) => {
    return (
        <FormControl fullWidth>
            <InputLabel>Group</InputLabel>
            <Select
                multiple
                value={groupBy}
                onChange={onGroupChange}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                            <Chip key={value} label={groupOptions.find(opt => opt.value === value)?.label || value} />
                        ))}
                    </Box>
                )}
            >
                {groupOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={groupBy.indexOf(option.value) > -1} />
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default InvoiceGroupBy;