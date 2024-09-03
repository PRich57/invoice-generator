import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, MenuItem, Stack, CircularProgress, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Formik, Form, FieldArray, getIn } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';

interface Contact {
    id: number;
    name: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
}

interface InvoiceFormData {
    invoice_number: string;
    invoice_date: Date;
    bill_to_id: number;
    send_to_id: number;
    items: InvoiceItem[];
    tax_rate: number;
}

const validationSchema = Yup.object().shape({
    invoice_number: Yup.string().required('Invoice number is required'),
    invoice_date: Yup.date().required('Invoice date is required'),
    bill_to_id: Yup.number().required('Bill to contact is required'),
    send_to_id: Yup.number().required('Send to contact is required'),
    items: Yup.array().of(
        Yup.object().shape({
            description: Yup.string().required('Description is required'),
            quantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
            unit_price: Yup.number().min(0, 'Unit price must be non-negative').required('Unit price is required'),
        })
    ).min(1, 'At least one item is required'),
    tax_rate: Yup.number().min(0, 'Tax rate must be non-negative').max(100, 'Tax rate must not exceed 100').required('Tax rate is required'),
});

const InvoiceForm: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [initialValues, setInitialValues] = useState<InvoiceFormData>({
        invoice_number: '',
        invoice_date: new Date(),
        bill_to_id: 0,
        send_to_id: 0,
        items: [{ description: '', quantity: 1, unit_price: 0 }],
        tax_rate: 0,
    });

    useEffect(() => {
        fetchContacts();
        if (id) {
            fetchInvoice();
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchContacts = async () => {
        try {
            const response = await api.get('/contacts');
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setError('Failed to fetch contacts. Please try again later.');
        }
    };

    const fetchInvoice = async () => {
        try {
            const response = await api.get(`/invoices/${id}`);
            // Convert string date to Date object
            response.data.invoice_date = new Date(response.data.invoice_date);
            setInitialValues(response.data);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            setError('Failed to fetch invoice details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: InvoiceFormData, { setSubmitting }: any) => {
        try {
            if (id) {
                await api.put(`/invoices/${id}`, values);
            } else {
                await api.post('/invoices', values);
            }
            navigate('/invoices');
        } catch (error) {
            console.error('Error saving invoice:', error);
            setError('Failed to save invoice. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                {id ? 'Edit Invoice' : 'Create New Invoice'}
            </Typography>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                    <Form>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    name="invoice_number"
                                    label="Invoice Number"
                                    value={values.invoice_number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.invoice_number && !!errors.invoice_number}
                                    helperText={touched.invoice_number && errors.invoice_number}
                                />
                                <DatePicker
                                    label="Invoice Date"
                                    value={values.invoice_date}
                                    onChange={(newValue) => setFieldValue('invoice_date', newValue)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: touched.invoice_date && !!errors.invoice_date,
                                            helperText: touched.invoice_date && errors.invoice_date ? String(errors.invoice_date) : undefined,
                                        } as any,
                                    }}
                                />
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    select
                                    name="bill_to_id"
                                    label="Bill To"
                                    value={values.bill_to_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.bill_to_id && !!errors.bill_to_id}
                                    helperText={touched.bill_to_id && errors.bill_to_id}
                                >
                                    {contacts.map((contact) => (
                                        <MenuItem key={contact.id} value={contact.id}>
                                            {contact.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    select
                                    name="send_to_id"
                                    label="Send To"
                                    value={values.send_to_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.send_to_id && !!errors.send_to_id}
                                    helperText={touched.send_to_id && errors.send_to_id}
                                >
                                    {contacts.map((contact) => (
                                        <MenuItem key={contact.id} value={contact.id}>
                                            {contact.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>

                            <Typography variant="h6" gutterBottom>
                                Invoice Items
                            </Typography>
                            <FieldArray name="items">
                                {({ push, remove }) => (
                                    <Stack spacing={2}>
                                        {values.items.map((item, index) => (
                                            <Stack key={index} spacing={2}>
                                                <TextField
                                                    fullWidth
                                                    name={`items.${index}.description`}
                                                    label="Description"
                                                    value={item.description}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.items?.[index]?.description && !!getIn(errors, `items.${index}.description`)}
                                                    helperText={touched.items?.[index]?.description && getIn(errors, `items.${index}.description`)}
                                                />
                                                <Stack direction="row" spacing={2}>
                                                    <TextField
                                                        fullWidth
                                                        name={`items.${index}.quantity`}
                                                        label="Quantity"
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.items?.[index]?.quantity && !!getIn(errors, `items.${index}.quantity`)}
                                                        helperText={touched.items?.[index]?.quantity && getIn(errors, `items.${index}.quantity`)}
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        name={`items.${index}.unit_price`}
                                                        label="Unit Price"
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.items?.[index]?.unit_price && !!getIn(errors, `items.${index}.unit_price`)}
                                                        helperText={touched.items?.[index]?.unit_price && getIn(errors, `items.${index}.unit_price`)}
                                                    />
                                                </Stack>
                                                <Button onClick={() => remove(index)} color="secondary">
                                                    Remove Item
                                                </Button>
                                            </Stack>
                                        ))}
                                        <Button onClick={() => push({ description: '', quantity: 1, unit_price: 0 })}>
                                            Add Item
                                        </Button>
                                    </Stack>
                                )}
                            </FieldArray>

                            <TextField
                                fullWidth
                                name="tax_rate"
                                label="Tax Rate (%)"
                                type="number"
                                value={values.tax_rate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.tax_rate && !!errors.tax_rate}
                                helperText={touched.tax_rate && errors.tax_rate}
                            />

                            <Button type="submit" variant="contained" color="primary">
                                Save Invoice
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default InvoiceForm;