import { useState, useCallback, useEffect, useMemo } from 'react';
import { getInvoices } from '../services/api/invoices';
import { Invoice, InvoiceFilters } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const { error, setError, handleError } = useErrorHandler();
    const [filters, setFilters] = useState<InvoiceFilters>({});
    const [groupBy, setGroupBy] = useState<string[]>([]);
    const [sorting, setSorting] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
        sortBy: 'invoice_number',
        sortOrder: 'desc'
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getInvoices({
                sort_by: sorting.sortBy,
                sort_order: sorting.sortOrder,
                group_by: groupBy,
                ...(Object.entries(filters) as [keyof InvoiceFilters, string | undefined][]).reduce((acc, [key, value]) => {
                    if (value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {} as Partial<InvoiceFilters>),
                total_min: filters.total_min ? parseFloat(filters.total_min) : undefined,
                total_max: filters.total_max ? parseFloat(filters.total_max) : undefined,
                skip: (page - 1) * pageSize, 
                limit: pageSize,
            });
            setInvoices(response.items || []);
            setTotalCount(response.total || 0);
            setError(null);
        } catch (err) {
            handleError(err);
            setInvoices([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [sorting, groupBy, filters, page, pageSize, handleError]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const updateFilters = useCallback((newFilters: Partial<InvoiceFilters>) => {
        setFilters(prevFilters => {
            const updatedFilters = { ...prevFilters };
            (Object.keys(newFilters) as Array<keyof InvoiceFilters>).forEach(key => {
                const value = newFilters[key];
                if (value === undefined) {
                    delete updatedFilters[key];
                } else {
                    updatedFilters[key] = value;
                }
            });
            return updatedFilters;
        });
        setPage(1);
    }, []);
    
    const updateSorting = useCallback((column: string) => {
        setSorting(prevSorting => ({
            sortBy: column,
            sortOrder: 
                prevSorting.sortBy === column 
                    ? prevSorting.sortOrder === 'asc' ? 'desc' : 'asc'
                    : 'desc'
        }));
    }, []);

    const updateGrouping = useCallback((values: string[]) => {
        setGroupBy(values);
    }, []);

    const updatePage = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const updatePageSize = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(1);
    }, []);

    const invoiceCounts = useMemo(() => {
        return {
            total: totalCount,
            overdue: invoices.filter(inv => inv.status === 'OVERDUE').length,
            unpaid: invoices.filter(inv => inv.status === 'UNPAID').length,
            paid: invoices.filter(inv => inv.status === 'PAID').length,
        };
    }, [invoices, totalCount]);

    const invoiceTotals = useMemo(() => {
        const calculateTotal = (filteredInvoices: Invoice[]) => {
            return filteredInvoices.reduce((sum, inv) => {
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
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        groupBy,
        filters,
        invoiceCounts,
        invoiceTotals,
        recentInvoices,
        getPaidInvoices,
        page,
        pageSize,
        totalCount,
        updatePage,
        updatePageSize,
    };
};