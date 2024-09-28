import { useCallback, useEffect, useMemo, useState } from 'react';
import { getInvoices } from '../services/api/invoices';
import { Invoice, InvoiceFilters } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoiceCount, setInvoiceCount] = useState<Number>(0);
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

    const invoiceCounts = useMemo(() => {
        return {
            total: invoices.length,
            overdue: invoices.filter(inv => inv.status === 'OVERDUE').length,
            unpaid: invoices.filter(inv => inv.status === 'UNPAID').length,
            paid: invoices.filter(inv => inv.status === 'PAID').length,
        };
    }, [invoices]);

    const invoiceTotals = useMemo(() => {
        const calculateTotal = (invoices: Invoice[]) => {
            return invoices.reduce((sum, inv) => {
                const total = typeof inv.total === 'number' ? inv.total : parseFloat(inv.total);
                return isNaN(total) ? sum : sum + total;
            }, 0);
        };

        return {
            overdue: calculateTotal(invoices.filter(inv => inv.status === 'OVERDUE')),
            unpaid: calculateTotal(invoices.filter(inv => inv.status === 'UNPAID')),
            paid: calculateTotal(invoices.filter(inv => inv.status === 'PAID')),
        };
    }, [invoices]);

    const recentInvoices = useMemo(() => {
        return [...invoices]
            .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime())
            .slice(0, 5);
    }, [invoices]);

    const getPaidInvoices = useCallback((period: '30' | '60' | '90' | 'all') => {
        const currentDate = new Date();
        const paidInvoices = invoices.filter(invoice => invoice.status === 'PAID');

        if (period === 'all') {
            return paidInvoices;
        }

        const daysAgo = parseInt(period);
        const startDate = new Date(currentDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        return paidInvoices.filter(invoice => new Date(invoice.invoice_date) >= startDate);
    }, [invoices]);

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
        invoiceCounts,
        invoiceTotals,
        recentInvoices,
        getPaidInvoices,
    };
};