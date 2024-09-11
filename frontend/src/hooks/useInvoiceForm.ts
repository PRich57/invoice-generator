import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { InvoiceCreate, Invoice } from '../types';
import { invoiceValidationSchema } from '../validationSchemas/invoiceValidationSchema';
import { useErrorHandler } from './useErrorHandler';
import { formatDateForAPI } from '../utils/dateFormatter';
import { useFetch } from './useFetch';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const useInvoiceForm = (id?: string) => {
    const navigate = useNavigate();
    const { handleError } = useErrorHandler();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues: InvoiceCreate = {
        invoice_number: '',
        invoice_date: formatDateForAPI(new Date()),
        bill_to_id: 0,
        send_to_id: 0,
        tax_rate: 0,
        discount_percentage: 0,
        notes: '',
        items: [{
            description: '',
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            subitems: [],
        }],
        template_id: 0,
    };

    const { data, isLoading, error, refetch } = useFetch<Invoice | null>(
        id ? `${API_ENDPOINTS.INVOICES}/${id}` : null
    );

    const { fetchData: submitForm } = useFetch<Invoice>(
        API_ENDPOINTS.INVOICES,
        { method: id ? 'PUT' : 'POST' }
    );

    const formik = useFormik<InvoiceCreate & { id?: number }>({
        initialValues: data || initialValues,
        validationSchema: invoiceValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                await submitForm({
                    data: values,
                    url: id ? `${API_ENDPOINTS.INVOICES}/${id}` : API_ENDPOINTS.INVOICES
                })
                navigate('/invoices');
            } catch (err) {
                handleError(err);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return { formik, isLoading, error, isSubmitting, refetch, id };
};