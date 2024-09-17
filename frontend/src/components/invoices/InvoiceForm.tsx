import React from 'react';
import { TextField, Button, Box, MenuItem, FormControl, InputLabel, Select, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import { invoiceValidationSchema } from '../../validationSchemas/invoiceValidationSchema';
import { InvoiceCreate, Contact, Template } from '../../types';
import { InvoiceItemFields } from './InvoiceItemFields';
import { formatDateForAPI } from '../../utils/dateFormatter';

interface InvoiceFormProps {
    initialValues: InvoiceCreate;
    contacts: Contact[];
    templates: Template[];
    onSubmit: (values: InvoiceCreate) => void;
    isSubmitting: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialValues, contacts, templates, onSubmit, isSubmitting }) => {
    const formik = useFormik({
        initialValues,
        validationSchema: invoiceValidationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    const handleDateChange = (date: Date | null) => {
        if (date) {
            formik.setFieldValue('invoice_date', formatDateForAPI(date));
        }
    };

    return (
        <FormikProvider value={formik}>
            <Box component="form" onSubmit={formik.handleSubmit}>
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
                        name="template_id"
                        value={formik.values.template_id}
                        onChange={formik.handleChange}
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
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </Box>
            </Box>
        </FormikProvider>
    );
};

export default InvoiceForm;