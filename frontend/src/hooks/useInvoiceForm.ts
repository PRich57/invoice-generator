import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { InvoiceCreate, Invoice } from '../types';
import { invoiceValidationSchema } from '../validationSchemas/invoiceValidationSchema';
import { useErrorHandler } from './useErrorHandler';
import { useFetch } from './useFetch';
import { formatDateForAPI } from '../utils/dateFormatter';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { useSnackbar } from 'notistack';
import { getNextInvoiceNumber } from '../services/api/invoices';

export const useInvoiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues: InvoiceCreate = {
        invoice_number: '',
        invoice_date: formatDateForAPI(new Date()),
        bill_to_id: null,
        send_to_id: null,
        tax_rate: 0,
        discount_percentage: 0,
        notes: '',
        items: [
            {
                description: '',
                quantity: 1,
                unit_price: 0,
                discount_percentage: 0,
                subitems: [],
            },
        ],
        template_id: 1,
    };

    const { data: invoiceData, isLoading, refetch } = useFetch<Invoice | null>(
        id ? `${API_ENDPOINTS.INVOICES}/${id}` : null
    );

    const { fetchData: submitForm } = useFetch<Invoice>(
        API_ENDPOINTS.INVOICES,
        { method: id ? 'PUT' : 'POST' }
    );

    useEffect(() => {
        if (id) {
            refetch();
        } else {
            // Fetch next invoice number when creating a new invoice
            getNextInvoiceNumber()
                .then(nextNumber => {
                    formik.setFieldValue('invoice_number', nextNumber);
                })
                .catch(handleError);
        }
    }, [id]);

    const formik = useFormik<InvoiceCreate>({
        initialValues: invoiceData || initialValues,
        validationSchema: invoiceValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                await submitForm({
                    data: values,
                    url: id ? `${API_ENDPOINTS.INVOICES}/${id}` : API_ENDPOINTS.INVOICES
                });
                enqueueSnackbar(id ? 'Invoice updated successfully' : 'Invoice created successfully',
                    { variant: 'success' }
                );
                navigate('/invoices');
            } catch (err) {
                handleError(err);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return { formik, isLoading, isSubmitting };
};
