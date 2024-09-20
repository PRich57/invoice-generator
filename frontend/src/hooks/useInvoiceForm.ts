import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { InvoiceCreate } from '../types';
import { invoiceValidationSchema } from '../validationSchemas/invoiceValidationSchema';
import { useErrorHandler } from './useErrorHandler';
import { formatDateForAPI } from '../utils/dateFormatter';
import { createInvoice, updateInvoice, getInvoice } from '../services/api/invoices';
import { useSnackbar } from 'notistack';

export const useInvoiceForm = (id?: string) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();

    const initialValues: InvoiceCreate = {
        invoice_number: '',
        invoice_date: formatDateForAPI(new Date()),
        bill_to_id: 0,
        send_to_id: 0,
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
        template_id: 0,
    };

    const [initialData, setInitialData] = useState<InvoiceCreate>(initialValues);

    useEffect(() => {
        if (id) {
            const fetchInvoice = async () => {
                setIsLoading(true);
                try {
                    const invoice = await getInvoice(Number(id));
                    // Map the received invoice to InvoiceCreate format
                    const mappedInvoice: InvoiceCreate = {
                        invoice_number: invoice.invoice_number,
                        invoice_date: invoice.invoice_date,
                        bill_to_id: invoice.bill_to_id,
                        send_to_id: invoice.send_to_id,
                        tax_rate: invoice.tax_rate,
                        discount_percentage: invoice.discount_percentage,
                        notes: invoice.notes,
                        items: invoice.items.map((item) => ({
                            id: item.id,
                            description: item.description,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            discount_percentage: item.discount_percentage,
                            subitems: item.subitems.map((subitem) => ({
                                id: subitem.id,
                                description: subitem.description,
                            })),
                        })),
                        template_id: invoice.template_id,
                    };
                    setInitialData(mappedInvoice);
                } catch (err) {
                    handleError(err);
                    setError('Failed to load invoice data');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInvoice();
        }
    }, []);

    const formik = useFormik<InvoiceCreate>({
        initialValues: initialData,
        validationSchema: invoiceValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                if (id) {
                    await updateInvoice(Number(id), values);
                    enqueueSnackbar('Invoice updated successfully', { variant: 'success' });
                } else {
                    await createInvoice(values);
                    enqueueSnackbar('Invoice created successfully', { variant: 'success' });
                }
                navigate('/invoices');
            } catch (err) {
                handleError(err);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return { formik, isLoading, isSubmitting, error };
};
