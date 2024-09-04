import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, MenuItem, IconButton, TextFieldProps } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { InvoiceCreate, Contact, InvoiceItem, InvoiceSubItem } from '../types';
import { createInvoice, getInvoice, updateInvoice } from '../services/api';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useContacts } from '../hooks/useContacts';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { invoiceValidationSchema } from '../validationSchemas/invoiceValidationSchema';
import { formatDate, formatDateForAPI } from '../utils/dateFormatter';
import { InvoiceItemFields } from '../components/invoices/InvoiceItemFields';

const InvoiceForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { contacts, error: contactsError, loading: contactsLoading } = useContacts();
    const { error, setError, handleError } = useErrorHandler();

    const initialValues: InvoiceCreate = useMemo(() => ({
        invoice_number: '',
        invoice_date: formatDateForAPI(new Date()),
        bill_to_id: 0,
        send_to_id: 0,
        tax_rate: 0,
        discount_percentage: 0,
        notes: '',
        items: [{
            id: 0,
            description: '',
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            subitems: []
        }],
    }), []);

    const formik = useFormik<InvoiceCreate>({
        initialValues,
        validationSchema: invoiceValidationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                if (id) {
                    await updateInvoice(parseInt(id), values);
                } else {
                    await createInvoice(values);
                }
                navigate('/invoices');
            } catch (err) {
                handleError(err);
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if (id) {
            const fetchInvoice = async () => {
                setLoading(true);
                try {
                    const response = await getInvoice(parseInt(id));
                    formik.setValues(response.data);
                } catch (err) {
                    handleError(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchInvoice();
        }
    }, [id, handleError]);

    if (loading || contactsLoading) return <LoadingSpinner />;
    if (error || contactsError) return <ErrorMessage message={error || contactsError || 'An error occurred'} />;

    return (
        <FormikProvider value={formik}>
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 800, margin: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    {id ? 'Edit Invoice' : 'Create New Invoice'}
                </Typography>

                <TextField
                    fullWidth
                    margin="normal"
                    name="invoice_number"
                    label="Invoice Number"
                    value={formik.values.invoice_number}
                    onChange={formik.handleChange}
                    error={formik.touched.invoice_number && Boolean(formik.errors.invoice_number)}
                    helperText={formik.touched.invoice_number && formik.errors.invoice_number}
                />

                <DatePicker
                    label="Invoice Date"
                    value={formik.values.invoice_date ? new Date(formik.values.invoice_date) : null}
                    onChange={(date) => formik.setFieldValue('invoice_date', date ? formatDateForAPI(date) : null)}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            margin: "normal",
                        } as Partial<TextFieldProps>,
                    }}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    select
                    name="bill_to_id"
                    label="Bill To"
                    value={formik.values.bill_to_id}
                    onChange={formik.handleChange}
                    error={formik.touched.bill_to_id && Boolean(formik.errors.bill_to_id)}
                    helperText={formik.touched.bill_to_id && formik.errors.bill_to_id}
                >
                    {contacts.map((contact) => (
                        <MenuItem key={contact.id} value={contact.id}>
                            {contact.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    margin="normal"
                    select
                    name="send_to_id"
                    label="Send To"
                    value={formik.values.send_to_id}
                    onChange={formik.handleChange}
                    error={formik.touched.send_to_id && Boolean(formik.errors.send_to_id)}
                    helperText={formik.touched.send_to_id && formik.errors.send_to_id}
                >
                    {contacts.map((contact) => (
                        <MenuItem key={contact.id} value={contact.id}>
                            {contact.name}
                        </MenuItem>
                    ))}
                </TextField>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Invoice Items
                </Typography>

                <FieldArray name="items">
                    {({ push, remove }) => (
                        <>
                            {formik.values.items.map((item, index) => (
                                <Box key={index}>
                                    <InvoiceItemFields index={index} />
                                    <Button onClick={() => remove(index)} color="secondary">
                                        Remove Item
                                    </Button>
                                </Box>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => push({ id: 0, description: '', quantity: 1, unit_price: 0, discount_percentage: 0, subitems: [] })}
                            >
                                Add Item
                            </Button>
                        </>
                    )}
                </FieldArray>

                <TextField
                    fullWidth
                    margin="normal"
                    name="tax_rate"
                    label="Tax Rate (%)"
                    type="number"
                    value={formik.values.tax_rate}
                    onChange={formik.handleChange}
                    error={formik.touched.tax_rate && Boolean(formik.errors.tax_rate)}
                    helperText={formik.touched.tax_rate && formik.errors.tax_rate}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    name="discount_percentage"
                    label="Discount (%)"
                    type="number"
                    value={formik.values.discount_percentage}
                    onChange={formik.handleChange}
                    error={formik.touched.discount_percentage && Boolean(formik.errors.discount_percentage)}
                    helperText={formik.touched.discount_percentage && formik.errors.discount_percentage}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    name="notes"
                    label="Notes"
                    multiline
                    rows={4}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                    helperText={formik.touched.notes && formik.errors.notes}
                />

                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    Save Invoice
                </Button>
            </Box>
        </FormikProvider>
    );
};

export default InvoiceForm;