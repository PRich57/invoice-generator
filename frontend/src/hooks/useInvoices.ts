import { useState, useEffect, useCallback } from 'react';
import { Invoice } from '../types';
import { getInvoices } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const { error, setError, handleError } = useErrorHandler();

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const invoicesData = await getInvoices();
            setInvoices(invoicesData);
            if (invoicesData.length > 0) {
                setSelectedInvoice(invoicesData[0]);
            }
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const refetch = useCallback(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return { invoices, selectedInvoice, setSelectedInvoice, error, loading, refetch };
};