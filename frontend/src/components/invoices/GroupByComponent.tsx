import React from 'react';
import {
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';

interface GroupByComponentProps {
    groupBy: string[];
    onUpdateGrouping: (value: string[]) => void;
}

export const groupOptions = [
    { value: 'bill_to', label: 'Bill To' },
    { value: 'send_to', label: 'Send To' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'status', label: 'Status' },
    { value: 'client_type', label: 'Client Type' },
    { value: 'invoice_type', label: 'Invoice Type' },
];

const GroupByComponent: React.FC<GroupByComponentProps> = ({
    groupBy,
    onUpdateGrouping,
}) => {
    return (
        <FormControl component="fieldset">
            <RadioGroup
                value={groupBy}
                onChange={(e) => onUpdateGrouping([e.target.value])}
            >
                {groupOptions.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

export default GroupByComponent;