// src/components/invoices/InvoiceForm.tsx

import React from 'react';
import {
    TextField,
    Button,
    Box,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography,
    SelectChangeEvent,
} from '@mui/material';
import { useFormikContext, FieldArray } from 'formik';
import { InvoiceCreate, Contact, Template, InvoiceFormProps } from '../../types';
import InvoiceItemFields from './InvoiceItemFields';
import { formatDateForAPI } from '../../utils/dateFormatter';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import NumericTextField from '../common/NumericTextField';

const InvoiceForm: React.FC<InvoiceFormProps> = ({
    contacts,
    templates,
    isSubmitting,
    setSelectedTemplate,
    isAuthenticated,
    handlePreview,
    isPDFGenerating,
    selectedTemplate,
}) => {
    const formik = useFormikContext<InvoiceCreate>();

    const handleTemplateChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        const templateId = value === '' ? null : Number(value);
        formik.setFieldValue('template_id', templateId);
        const selected = templates.find((t) => t.id === templateId) || null;
        setSelectedTemplate(selected);
    };

    const handleBillToChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        const billToId = value === '' ? null : Number(value);
        formik.setFieldValue('bill_to_id', billToId);
    };

    const handleSendToChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        const sendToId = value === '' ? null : Number(value);
        formik.setFieldValue('send_to_id', sendToId);
    };

    const handleDateChange = (newValue: dayjs.Dayjs | null) => {
        if (newValue) {
            formik.setFieldValue('invoice_date', formatDateForAPI(newValue.toDate()));
        }
    };

    return (
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
                        size='small'
                    />
                </Box>
                <Box flex="1 1 45%">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Invoice Date"
                            value={formik.values.invoice_date ? dayjs(formik.values.invoice_date) : null}
                            onChange={handleDateChange}
                            slotProps={{ textField: { fullWidth: true, size: "small" } }}
                        />
                    </LocalizationProvider>
                </Box>
                <Box flex="1 1 45%">
                    <FormControl fullWidth>
                        <InputLabel size='small' id="bill-to-label">Bill To</InputLabel>
                        <Select
                            labelId="bill-to-label"
                            name="bill_to_id"
                            value={formik.values.bill_to_id !== null ? formik.values.bill_to_id.toString() : ''}
                            onChange={handleBillToChange}
                            error={formik.touched.bill_to_id && Boolean(formik.errors.bill_to_id)}
                            label="Bill To"
                            size='small'
                        >
                            <MenuItem value="">
                                <em>Select Contact</em>
                            </MenuItem>
                            {contacts.map((contact) => (
                                <MenuItem key={contact.id} value={contact.id.toString()}>
                                    {contact.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box flex="1 1 45%">
                    <FormControl fullWidth>
                        <InputLabel size='small' id="send-to-label">Send To</InputLabel>
                        <Select
                            labelId="send-to-label"
                            name="send_to_id"
                            value={formik.values.send_to_id !== null ? formik.values.send_to_id.toString() : ''}
                            onChange={handleSendToChange}
                            error={formik.touched.send_to_id && Boolean(formik.errors.send_to_id)}
                            label="Send To"
                            size='small'

                        >
                            <MenuItem value="">
                                <em>Select Contact</em>
                            </MenuItem>
                            {contacts.map((contact) => (
                                <MenuItem key={contact.id} value={contact.id.toString()}>
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
                            <InvoiceItemFields key={index} index={index} remove={remove} />
                        ))}
                        <Button
                            onClick={() =>
                                push({
                                    description: '',
                                    quantity: 1,
                                    unit_price: 0,
                                    discount_percentage: 0,
                                    subitems: []
                                })
                            }
                            variant="contained"
                            color="primary"
                        >
                            Add Item
                        </Button>
                    </>
                )}
            </FieldArray>

            <Box display="flex" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
                <Box flex="1 1 45%">
                    <NumericTextField
                        fullWidth
                        name="tax_rate"
                        label="Tax Rate (%)"
                        placeholder='8.00'
                        // value={formik.values.tax_rate}
                        onChange={formik.handleChange}
                        error={formik.touched.tax_rate && Boolean(formik.errors.tax_rate)}
                        helperText={formik.touched.tax_rate && formik.errors.tax_rate}
                        slotProps={{ inputLabel: { shrink: true } }}
                        endAdornment="%"
                        size='small'
                    />
                </Box>
                <Box flex="1 1 45%">
                    <NumericTextField
                        fullWidth
                        name="discount_percentage"
                        label="Discount (%)"
                        placeholder={`${formik.values.discount_percentage}.00`}
                        onChange={formik.handleChange}
                        error={formik.touched.discount_percentage && Boolean(formik.errors.discount_percentage)}
                        helperText={formik.touched.discount_percentage && formik.errors.discount_percentage}
                        slotProps={{ inputLabel: { shrink: true } }}
                        endAdornment="%"
                        size='small'
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
                size='small'
            />

            <FormControl fullWidth margin="normal">
                <InputLabel size='small' id="template-select-label">Template</InputLabel>
                <Select
                    labelId="template-select-label"
                    name="template_id"
                    value={formik.values.template_id !== null ? formik.values.template_id.toString() : ''}
                    onChange={handleTemplateChange}
                    error={formik.touched.template_id && Boolean(formik.errors.template_id)}
                    label="Template"
                    size='small'
                >
                    <MenuItem value="">
                        <em>Select Template</em>
                    </MenuItem>
                    {templates.map((template) => (
                        <MenuItem key={template.id} value={template.id.toString()}>
                            {template.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box mt={2} display="flex" gap={2}>
                {isAuthenticated && (
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Save Invoice'}
                    </Button>
                )}
                <Button
                    onClick={handlePreview}
                    variant="outlined"
                    color="secondary"
                    disabled={isPDFGenerating || !selectedTemplate}
                >
                    {isPDFGenerating ? 'Generating PDF...' : 'PDF Preview'}
                </Button>
            </Box>
        </Box>
    );
};

export default InvoiceForm;
