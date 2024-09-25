import { useCallback, useEffect, useState } from 'react';
import { getInvoices } from '../services/api';
import { Invoice } from '../types';
import { useErrorHandler } from './useErrorHandler';

interface InvoiceFilters {
    invoice_number?: string;
    bill_to_name?: string;
    send_to_name?: string;
    client_type?: string;
    invoice_type?: string;
    date_from?: string;
    date_to?: string;
    total_min?: string;
    total_max?: string;
    status?: string;
}

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { error, setError, handleError } = useErrorHandler();
    const [sortBy, setSortBy] = useState<string>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [groupBy, setGroupBy] = useState<string[]>([]);
    const [filters, setFilters] = useState<InvoiceFilters>({
        invoice_number: '',
        bill_to_name: '',
        send_to_name: '',
        client_type: '',
        invoice_type: '',
        status: '',
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
                group_by: groupBy,
                invoice_number: filters.invoice_number || undefined,
                bill_to_name: filters.bill_to_name || undefined,
                send_to_name: filters.send_to_name || undefined,
                client_type: filters.client_type || undefined,
                invoice_type: filters.invoice_type || undefined,
                status: filters.status || undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
                total_min: filters.total_min ? parseFloat(filters.total_min) : undefined,
                total_max: filters.total_max ? parseFloat(filters.total_max) : undefined,
                skip: 0, 
                limit: 25,
            });
            setInvoices(invoicesData);
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder, groupBy, handleError, filters]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const updateSorting = useCallback((newSortBy: string) => {
        setSortBy((prevSortBy) => {
            if (newSortBy === prevSortBy) {
                setSortOrder((prevOrder) => (prevOrder === 'desc' ? 'asc' : 'desc'));
            } else {
                setSortOrder('desc');
            }
            return newSortBy;
        });
    }, []);

    const updateGrouping = useCallback((newGroupBy: string[]) => {
        setGroupBy(newGroupBy);
    }, []);

    const updateFilters = useCallback((newFilters: Partial<InvoiceFilters>) => {
        setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
    }, []);

    return {
        invoices,
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
