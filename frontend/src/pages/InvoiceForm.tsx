import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormikProvider, FieldArray } from 'formik';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { useTemplates } from '../hooks/useTemplates';
import { usePDFGeneration } from '../hooks/usePDFGeneration';
import { useContacts } from '../hooks/useContacts';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import InvoicePreview from '../components/invoices/InvoicePreview';
import { formatDateForAPI } from '../utils/dateFormatter';
import { InvoiceItemFields } from '../components/invoices/InvoiceItemFields';
import { parseISO } from 'date-fns';
import { Contact } from '../types';

const InvoiceForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { formik, isLoading, error, isSubmitting } = useInvoiceForm(id);
    const [billToContact, setBillToContact] = useState<Contact | null>(null);
    const [sendToContact, setSendToContact] = useState<Contact | null>(null);
    const { templates, selectedTemplate, setSelectedTemplate, getTemplateById } = useTemplates();
    const { handlePreviewPDF, isGenerating: isPDFGenerating } = usePDFGeneration();
    const { contacts, error: contactsError, loading: contactsLoading } = useContacts();

    const handleTemplateChange = (event: SelectChangeEvent<number>) => {
        const templateId = event.target.value as number;
        const template = getTemplateById(templateId);
        setSelectedTemplate(template || null);
        formik.setFieldValue('template_id', templateId);
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            formik.setFieldValue('invoice_date', formatDateForAPI(date));
        }
    };

    const handlePreview = () => {
        if (selectedTemplate) {
            handlePreviewPDF(formik.values, selectedTemplate, id);
        }
    };

    if (isLoading) return <LoadingSpinner />;
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
                                    value={formik.values.invoice_date ? parseISO(formik.values.invoice_date) : null}
                                    onChange={handleDateChange}
                                    slotProps={{ textField: { fullWidth: true } }}
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
                                    {formik.values.items.map((item, index) => (
                                        <InvoiceItemFields key={index} index={index} />
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
                            <Button
                                onClick={handlePreview}
                                variant="outlined"
                                color="secondary"
                                disabled={isPDFGenerating}
                            >
                                {isPDFGenerating ? 'Generating PDF...' : 'PDF Preview'}
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

// import React from 'react';
// import { useParams } from 'react-router-dom';
// import { Typography, Box } from '@mui/material';
// import { useInvoiceForm } from '../hooks/useInvoiceForm';
// import { useTemplates } from '../hooks/useTemplates';
// import { usePDFGeneration } from '../hooks/usePDFGeneration';
// import { useContacts } from '../hooks/useContacts';
// import ErrorMessage from '../components/common/ErrorMessage';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import InvoicePreview from '../components/invoices/InvoicePreview';
// import InvoiceForm from '../components/invoices/InvoiceForm';
// import { InvoiceCreate } from '../types';

// const InvoiceFormPage: React.FC = () => {
//     const { id } = useParams<{ id: string }>();
//     const { formik, isLoading, error, isSubmitting } = useInvoiceForm(id);
//     const { templates, selectedTemplate, setSelectedTemplate } = useTemplates();
//     const { handlePreviewPDF, isGenerating: isPDFGenerating } = usePDFGeneration();
//     const { contacts, error: contactsError, loading: contactsLoading } = useContacts();

//     const handleSubmit = (values: InvoiceCreate) => {
//         formik.handleSubmit(values as any);
//     };

//     if (isLoading || contactsLoading) return <LoadingSpinner />;
//     if (error || contactsError) return <ErrorMessage message={error || contactsError || 'An error occurred'} />;

//     return (
//         <Box display="flex" flexDirection="column">
//             <Typography variant="h4" gutterBottom>
//                 {id ? 'Edit Invoice' : 'Create New Invoice'}
//             </Typography>
//             <Box display="flex" flexDirection="row">
//                 <Box sx={{ flex: 1, pr: 2 }}>
//                     <InvoiceForm
//                         initialValues={formik.values}
//                         contacts={contacts}
//                         templates={templates}
//                         onSubmit={handleSubmit}
//                         isSubmitting={isSubmitting}
//                     />
//                 </Box>
//                 <Box sx={{ flex: 1, pl: 2 }}>
//                     {selectedTemplate && (
//                         <InvoicePreview
//                             invoice={formik.values}
//                             template={selectedTemplate}
//                         />
//                     )}
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// export default InvoiceFormPage;