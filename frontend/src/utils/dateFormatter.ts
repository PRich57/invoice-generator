import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date: string | Date, formatString: string = 'YYYY-MM-DD'): string => {
    return dayjs(date).format(formatString);
};

export const formatDateForAPI = (date: Date): string => {
    return dayjs(date).format('YYYY-MM-DD');
};

export const formatDateForDisplay = (date: string | Date): string => {
    return dayjs(date).format('MMMM DD, YYYY');
};

export const parseDate = (date: string | Date): Dayjs => {
    return dayjs(date);
};