import { useState, useCallback, useEffect, useMemo } from 'react';
import { Invoice } from '../types';
import { getInvoices } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const useInvoices = () => {
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const { error, setError, handleError } = useErrorHandler();
    const [sortBy, setSortBy] = useState<string>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [groupBy, setGroupBy] = useState<string[]>([]);
    const [filters, setFilters] = useState({
        invoice_number: '',
        bill_to_name: '',
        send_to_name: '',
        date_from: '',
        date_to: '',
        total_min: '',
        total_max: '',
    });

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const invoicesData = await getInvoices({
                sort_by: sortBy,
                sort_order: sortOrder,
                group_by: groupBy.length > 0 ? groupBy : undefined,
            });
            setAllInvoices(invoicesData);
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder, groupBy, handleError]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const updateSorting = useCallback((newSortBy: string) => {
        setSortBy(prevSortBy => {
            if (newSortBy === prevSortBy) {
                setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
            } else {
                setSortOrder('asc');
            }
            return newSortBy;
        });
    }, []);

    const updateGrouping = useCallback((newGroupBy: string[]) => {
        setGroupBy(newGroupBy);
    }, []);

    const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    }, []);

    const filteredInvoices = useMemo(() => {
        return allInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.invoice_date);
            const dateFrom = filters.date_from ? new Date(filters.date_from) : null;
            const dateTo = filters.date_to ? new Date(filters.date_to) : null;

            return (
                invoice.invoice_number.toLowerCase().includes(filters.invoice_number.toLowerCase()) &&
                (filters.bill_to_name === '' || invoice.bill_to_id.toString().includes(filters.bill_to_name)) &&
                (filters.send_to_name === '' || invoice.send_to_id.toString().includes(filters.send_to_name)) &&
                (filters.total_min === '' || invoice.total >= parseFloat(filters.total_min)) &&
                (filters.total_max === '' || invoice.total <= parseFloat(filters.total_max)) &&
                (!dateFrom || invoiceDate >= dateFrom) &&
                (!dateTo || invoiceDate <= dateTo)
            );
        });
    }, [allInvoices, filters]);

    const invoiceCount = useMemo(() => allInvoices.length, [allInvoices]);

    return {
        invoices: filteredInvoices,
        invoiceCount,
        error,
        loading,
        fetchInvoices,
        updateSorting,
        updateGrouping,
        updateFilters,
        sortBy,
        sortOrder,
        groupBy,
        filters,
    };
};