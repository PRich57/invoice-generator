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

    const formik = useFormik<InvoiceCreate>({
        initialValues,
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

    useEffect(() => {
        if (invoiceData) {            
            // Map invoiceData to form fields
            const newValues = {
                invoice_number: invoiceData.invoice_number,
                invoice_date: invoiceData.invoice_date,
                bill_to_id: invoiceData.bill_to_id,
                send_to_id: invoiceData.send_to_id,
                tax_rate: invoiceData.tax_rate,
                discount_percentage: invoiceData.discount_percentage,
                notes: invoiceData.notes || '',
                items: invoiceData.items.map(item => ({
                    id: item.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount_percentage: item.discount_percentage,
                    subitems: item.subitems.map(subitem => ({
                        id: subitem.id,
                        description: subitem.description,
                    })),
                })),
                template_id: invoiceData.template_id,
            };
            
            formik.setValues(newValues);
        }
    }, [invoiceData]);

    return { formik, isLoading, isSubmitting };
};
