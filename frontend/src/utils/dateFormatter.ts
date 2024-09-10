import { format, parseISO } from 'date-fns';

export const formatDate = (date: string | Date, formatString: string = 'yyyy-MM-dd'): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatString);
};

export const formatDateForAPI = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
};

export const formatDateForDisplay = (date: string | Date): string => {
    return formatDate(date, 'MMMM dd, yyyy');
};