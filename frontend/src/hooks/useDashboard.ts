import { useState, useCallback, useEffect } from 'react';
import { getInvoices, getInvoiceTotals } from '../services/api/invoices';
import { Invoice, InvoiceTotals } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const useDashboard = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoiceTotals, setInvoiceTotals] = useState<InvoiceTotals>({
        total_count: 0,
        total_amount: 0,
        status_counts: {}
    });
    const [loading, setLoading] = useState(true);
    const { error, setError, handleError } = useErrorHandler();

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [invoicesResponse, totalsResponse] = await Promise.all([
                getInvoices({ limit: 1000 }),  // Fetch all invoices for dashboard
                getInvoiceTotals()
            ]);
            setInvoices(invoicesResponse.items || []);
            setInvoiceTotals(totalsResponse);
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const invoiceCounts = {
        total: invoiceTotals.total_count,
        overdue: invoiceTotals.status_counts['OVERDUE'] || 0,
        unpaid: invoiceTotals.status_counts['UNPAID'] || 0,
        paid: invoiceTotals.status_counts['PAID'] || 0,
    };

    const calculateTotalForStatus = (status: string) => {
        return invoices
            .filter(inv => inv.status === status)
            .reduce((sum, inv) => sum + Number(inv.total), 0);
    };

    const invoiceTotalAmounts = {
        overdue: calculateTotalForStatus('OVERDUE'),
        unpaid: calculateTotalForStatus('UNPAID'),
        paid: calculateTotalForStatus('PAID'),
    };

    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime())
        .slice(0, 5);

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
        invoiceCounts,
        invoiceTotals: invoiceTotalAmounts,
        recentInvoices,
        getPaidInvoices,
        refetch: fetchDashboardData,
    };
};