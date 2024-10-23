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

// Function to get the first and last day of the current month in UTC
export const getThisMonthRangeUTC = () => {
    const now = dayjs.utc();

    const start = now.startOf('month').format('YYYY-MM-DD');
    const end = now.endOf('month').format('YYYY-MM-DD');

    return { thisMonthStart: start, thisMonthEnd: end };
};

// Function to get the first and last day of the last month in UTC
export const getLastMonthRangeUTC = () => {
    const now = dayjs.utc();

    const lastMonth = now.subtract(1, 'month');
    const start = lastMonth.startOf('month').format('YYYY-MM-DD');
    const end = lastMonth.endOf('month').format('YYYY-MM-DD');

    return { lastMonthStart: start, lastMonthEnd: end };
}