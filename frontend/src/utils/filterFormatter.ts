import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { format } from 'date-fns'; // Keep for other formats if necessary

dayjs.extend(utc);

interface FilterLabelMap {
    [key: string]: {
        label: string;
        formatValue?: (value: string) => string;
    };
}

export const filterLabels: FilterLabelMap = {
    invoice_number: {
        label: 'Invoice Number'
    },
    bill_to_name: {
        label: 'Bill To'
    },
    send_to_name: {
        label: 'Send To'
    },
    client_type: {
        label: 'Client Type',
        formatValue: (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    },
    invoice_type: {
        label: 'Invoice Type',
        formatValue: (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    },
    status: {
        label: 'Status',
        formatValue: (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    },
    date_from: {
        label: 'From Date',
        formatValue: (value: string) => dayjs.utc(value).format('MM/DD/YYYY')
    },
    date_to: {
        label: 'To Date',
        formatValue: (value: string) => dayjs.utc(value).format('MM/DD/YYYY')
    },
    total_min: {
        label: 'Min Total',
        formatValue: (value: string) => `$${Number(value).toLocaleString()}`
    },
    total_max: {
        label: 'Max Total',
        formatValue: (value: string) => `$${Number(value).toLocaleString()}`
    }
};

export const formatFilterLabel = (key: string, value: string): string => {
    const filterInfo = filterLabels[key];
    if (!filterInfo) return `${key}: ${value}`;
    
    const formattedValue = filterInfo.formatValue ? filterInfo.formatValue(value) : value;
    return `${filterInfo.label}: ${formattedValue}`;
};