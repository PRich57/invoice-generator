import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    TextField, 
    Button, 
    Typography, 
    Box, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Select, 
    SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { InvoiceCreate, Template, InvoiceItemCreate, Contact } from '../types';
import { createInvoice, updateInvoice, getTemplates, getInvoice, getContact } from '../services/api';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useContacts } from '../hooks/useContacts';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { invoiceValidationSchema } from '../validationSchemas/invoiceValidationSchema';
import InvoicePreview from '../components/invoices/InvoicePreview';
import { formatDateForAPI } from '../utils/dateFormatter';

const InvoiceForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [billToContact, setBillToContact] = useState<Contact | null>(null);
    const [sendToContact, setSendToContact] = useState<Contact | null>(null);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { contacts, error: contactsError, loading: contactsLoading } = useContacts();
    const { error, setError, handleError } = useErrorHandler();

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
            line_total: 0,
        }],
        template_id: 0,
    };

    const formik = useFormik<InvoiceCreate>({
        initialValues,
        validationSchema: invoiceValidationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
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
                setIsSubmitting(false);
            }
        },
    });

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await getTemplates();
                setTemplates(response.data);
                if (response.data.length > 0) {
                    setSelectedTemplate(response.data[0]);
                    formik.setFieldValue('template_id', response.data[0].id);
                }
            } catch (err) {
                handleError(err);
            }
        };

        const fetchInvoice = async () => {
            if (id) {
                try {
                    setLoading(true);
                    const response = await getInvoice(parseInt(id));
                    formik.setValues(response.data);
                    setSelectedTemplate(templates.find(t => t.id === response.data.template_id) || null);
                } catch (err) {
                    handleError(err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTemplates();
        fetchInvoice();
    }, [id]);

    useEffect(() => {
        if (contacts.length > 0 && formik.values.bill_to_id === 0 && formik.values.send_to_id === 0) {
            formik.setFieldValue('bill_to_id', contacts[0].id);
            formik.setFieldValue('send_to_id', contacts[0].id);
        }
    }, [contacts]);

    useEffect(() => {
        const fetchContact = async (contactId: number, setContact: React.Dispatch<React.SetStateAction<Contact | null>>) => {
            if (contactId) {
                try {
                    const response = await getContact(contactId);
                    setContact(response.data);
                } catch (err) {
                    handleError(err);
                }
            }
        };

        fetchContact(formik.values.bill_to_id, setBillToContact);
        fetchContact(formik.values.send_to_id, setSendToContact);
    }, [formik.values.bill_to_id, formik.values.send_to_id]);

    const handleTemplateChange = (event: SelectChangeEvent<number>) => {
        const templateId = event.target.value as number;
        const template = templates.find(t => t.id === templateId);
        setSelectedTemplate(template || null);
        formik.setFieldValue('template_id', templateId);
    };

    const handlePrintToPDF = () => {
        window.print();
    };

    if (loading || contactsLoading) return <LoadingSpinner />;
    if (error || contactsError) return <ErrorMessage message={error || contactsError || 'An error occurred'} />;


    return (
        <FormikProvider value={formik}>
            <Box display="flex" flexDirection="column">
                <Typography variant="h4" gutterBottom>
                    {id ? 'Edit Invoice' : 'Create New Invoice'}
                </Typography>
                <Box display="flex" flexDirection="row">
                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ flex: 1, pr: 2 }}>
                        <Box display="flex" flexWrap="wrap" gap={2}>
                            <Box flex="1 1 45%">
                                <TextField
                                    fullWidth
                                    name="invoice_number"
                                    label="Invoice Number"
                                    value={formik.values.invoice_number}
                                    onChange={formik.handleChange}
                                    error={formik.touched.invoice_number && Boolean(formik.errors.invoice_number)}
                                    helperText={formik.touched.invoice_number && formik.errors.invoice_number}
                                />
                            </Box>
                            <Box flex="1 1 45%">
                                <DatePicker
                                    label="Invoice Date"
                                    value={formik.values.invoice_date ? new Date(formik.values.invoice_date) : null}
                                    onChange={(date) => formik.setFieldValue('invoice_date', date ? formatDateForAPI(date) : null)}
                                />
                            </Box>
                            <Box flex="1 1 45%">
                                <FormControl fullWidth>
                                    <InputLabel id="bill-to-label">Bill To</InputLabel>
                                    <Select
                                        labelId="bill-to-label"
                                        name="bill_to_id"
                                        value={formik.values.bill_to_id}
                                        onChange={formik.handleChange}
                                        error={formik.touched.bill_to_id && Boolean(formik.errors.bill_to_id)}
                                    >
                                        {contacts.map((contact) => (
                                            <MenuItem key={contact.id} value={contact.id}>
                                                {contact.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box flex="1 1 45%">
                                <FormControl fullWidth>
                                    <InputLabel id="send-to-label">Send To</InputLabel>
                                    <Select
                                        labelId="send-to-label"
                                        name="send_to_id"
                                        value={formik.values.send_to_id}
                                        onChange={formik.handleChange}
                                        error={formik.touched.send_to_id && Boolean(formik.errors.send_to_id)}
                                    >
                                        {contacts.map((contact) => (
                                            <MenuItem key={contact.id} value={contact.id}>
                                                {contact.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Invoice Items
                        </Typography>

                        <FieldArray name="items">
                            {({ push, remove }) => (
                                <>
                                    {formik.values.items.map((item: InvoiceItemCreate, index: number) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <Box display="flex" flexWrap="wrap" gap={2}>
                                                <Box flex="1 1 100%">
                                                    <TextField
                                                        fullWidth
                                                        name={`items.${index}.description`}
                                                        label="Description"
                                                        value={item.description}
                                                        onChange={formik.handleChange}
                                                    />
                                                </Box>
                                                <Box flex="1 1 30%">
                                                    <TextField
                                                        fullWidth
                                                        name={`items.${index}.quantity`}
                                                        label="Quantity"
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={formik.handleChange}
                                                    />
                                                </Box>
                                                <Box flex="1 1 30%">
                                                    <TextField
                                                        fullWidth
                                                        name={`items.${index}.unit_price`}
                                                        label="Unit Price"
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={formik.handleChange}
                                                    />
                                                </Box>
                                                <Box flex="1 1 30%">
                                                    <TextField
                                                        fullWidth
                                                        name={`items.${index}.discount_percentage`}
                                                        label="Discount (%)"
                                                        type="number"
                                                        value={item.discount_percentage}
                                                        onChange={formik.handleChange}
                                                    />
                                                </Box>
                                            </Box>
                                            <FieldArray name={`items.${index}.subitems`}>
                                                {({ push: pushSubitem, remove: removeSubitem }) => (
                                                    <>
                                                        {item.subitems.map((subitem, subIndex) => (
                                                            <Box key={subIndex} display="flex" alignItems="center" mt={1}>
                                                                <TextField
                                                                    fullWidth
                                                                    name={`items.${index}.subitems.${subIndex}.description`}
                                                                    label="Subitem Description"
                                                                    value={subitem.description}
                                                                    onChange={formik.handleChange}
                                                                />
                                                                <Button onClick={() => removeSubitem(subIndex)}>Remove</Button>
                                                            </Box>
                                                        ))}
                                                        <Button onClick={() => pushSubitem({ description: '' })}>Add Subitem</Button>
                                                    </>
                                                )}
                                            </FieldArray>
                                            <Button onClick={() => remove(index)} color="secondary">
                                                Remove Item
                                            </Button>
                                        </Box>
                                    ))}
                                    <Button
                                        onClick={() => push({ description: '', quantity: 1, unit_price: 0, discount_percentage: 0, subitems: [] })}
                                    >
                                        Add Item
                                    </Button>
                                </>
                            )}
                        </FieldArray>

                        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
                            <Box flex="1 1 45%">
                                <TextField
                                    fullWidth
                                    name="tax_rate"
                                    label="Tax Rate (%)"
                                    type="number"
                                    value={formik.values.tax_rate}
                                    onChange={formik.handleChange}
                                    error={formik.touched.tax_rate && Boolean(formik.errors.tax_rate)}
                                    helperText={formik.touched.tax_rate && formik.errors.tax_rate}
                                />
                            </Box>
                            <Box flex="1 1 45%">
                                <TextField
                                    fullWidth
                                    name="discount_percentage"
                                    label="Discount (%)"
                                    type="number"
                                    value={formik.values.discount_percentage}
                                    onChange={formik.handleChange}
                                    error={formik.touched.discount_percentage && Boolean(formik.errors.discount_percentage)}
                                    helperText={formik.touched.discount_percentage && formik.errors.discount_percentage}
                                />
                            </Box>
                        </Box>

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

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="template-select-label">Template</InputLabel>
                            <Select
                                labelId="template-select-label"
                                id="template_id"
                                name="template_id"
                                value={formik.values.template_id}
                                onChange={handleTemplateChange}
                                error={formik.touched.template_id && Boolean(formik.errors.template_id)}
                            >
                                {templates.map((template) => (
                                    <MenuItem key={template.id} value={template.id}>
                                        {template.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box mt={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ mr: 2 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : (id ? 'Update Invoice' : 'Create Invoice')}
                            </Button>
                            <Button onClick={handlePrintToPDF} variant="outlined" color="secondary">
                                Print to PDF
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, pl: 2 }}>
                        {selectedTemplate && (
                            <InvoicePreview
                                invoice={formik.values}
                                template={selectedTemplate}
                                billToContact={billToContact}
                                sendToContact={sendToContact}
                            />
                        )}
                    </Box>
                </Box>
            </Box>
        </FormikProvider>
    );
};

export default InvoiceForm;