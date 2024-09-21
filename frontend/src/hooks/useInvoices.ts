import { useState, useEffect, useCallback } from 'react';
import { Invoice } from '../types';
import { getInvoices } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [invoiceCount, setInvoiceCount] = useState<number>(0);
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
                ...Object.entries(filters).reduce((acc, [key, value]) => {
                    if (value) acc[key] = value;
                    return acc;
                }, {} as Record<string, any>),
                total_min: filters.total_min ? parseFloat(filters.total_min) : undefined,
                total_max: filters.total_max ? parseFloat(filters.total_max) : undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
            });
            setInvoices(invoicesData);
            console.log(invoicesData);
            if (invoicesData.length > 0) {
                setSelectedInvoice(invoicesData[0]);
                setInvoiceCount(invoicesData.length);
            }
            setError(null);
        } catch (err) {
            console.error('Error in fetchInvoices:', err)
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder, groupBy, filters]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const updateSorting = (newSortBy: string) => {
        if (newSortBy === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

    const updateGrouping = (newGroupBy: string[]) => {
        setGroupBy(newGroupBy);
    };

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    return {
        invoices,
        invoiceCount,
        selectedInvoice,
        setSelectedInvoice,
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
        setFilters
    };
};