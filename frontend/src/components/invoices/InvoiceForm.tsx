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
    Stack,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useFormikContext, FieldArray } from 'formik';
import { InvoiceCreate, InvoiceFormProps } from '../../types';
import InvoiceItemFields from './InvoiceItemFields';
import { formatDateForAPI } from '../../utils/dateFormatter';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import NumericTextField from '../common/NumericTextField';
import { createInvoice, getNextInvoiceNumber } from '../../services/api/invoices';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import KeybindGuide from './KeybindGuide';

// Import DnD Kit components
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AddCircleOutline } from '@mui/icons-material';

const InvoiceForm: React.FC<InvoiceFormProps> = ({
    contacts,
    templates,
    isSubmitting,
    setSelectedTemplate,
    isAuthenticated,
    handlePreview,
    isPDFGenerating,
    selectedTemplate,
    isEditing,
}) => {
    const formik = useFormikContext<InvoiceCreate>();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // Initialize sensors for DnD Kit
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id && over) {
            const oldIndex = formik.values.items.findIndex(
                (item) => item.id?.toString() === active.id.toString()
            );
            const newIndex = formik.values.items.findIndex(
                (item) => item.id?.toString() === over.id.toString()
            );

            if (oldIndex !== -1 && newIndex !== -1) {
                const updatedItems = arrayMove(formik.values.items, oldIndex, newIndex);
                formik.setFieldValue('items', updatedItems);
            }
        }
    };

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

    const handleSaveAsNew = async () => {
        try {
            const nextInvoiceNumber = await getNextInvoiceNumber();
            const newInvoiceData = {
                ...formik.values,
                id: undefined,
                invoice_number: nextInvoiceNumber,
                items: formik.values.items.map((item) => ({
                    ...item,
                    id: undefined,
                    invoice_id: undefined,
                    subitems:
                        item.subitems?.map((subitem) => ({
                            ...subitem,
                            id: undefined,
                        })) || [],
                })),
            };
            await createInvoice(newInvoiceData);
            navigate('/invoices');
            enqueueSnackbar('Successfully saved as a new invoice.', { variant: 'success' });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error response:', error.response.data);
                enqueueSnackbar(
                    `Failed to save invoice as new: ${error.response.data.message}`,
                    { variant: 'error' }
                );
            } else {
                console.error('Unexpected error:', error);
                enqueueSnackbar('Failed to save invoice as new. Please try again.', {
                    variant: 'error',
                });
            }
        }
    };

    // Ensure that all items have unique ids
    React.useEffect(() => {
        const updatedItems = formik.values.items.map((item) => {
            if (!item.id) {
                return { ...item, id: Date.now() };
            }
            return item;
        });
        formik.setFieldValue('items', updatedItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        name="invoice_number"
                        label="Invoice Number"
                        value={formik.values.invoice_number}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.invoice_number && Boolean(formik.errors.invoice_number)
                        }
                        helperText={formik.touched.invoice_number && formik.errors.invoice_number}
                        size="small"
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Invoice Date"
                            value={
                                formik.values.invoice_date ? dayjs(formik.values.invoice_date) : null
                            }
                            onChange={handleDateChange}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                    </LocalizationProvider>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="bill-to-label">Bill To</InputLabel>
                        <Select
                            labelId="bill-to-label"
                            name="bill_to_id"
                            value={
                                formik.values.bill_to_id !== null
                                    ? formik.values.bill_to_id.toString()
                                    : ''
                            }
                            onChange={handleBillToChange}
                            error={formik.touched.bill_to_id && Boolean(formik.errors.bill_to_id)}
                            label="Bill To"
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
                    <FormControl fullWidth size="small">
                        <InputLabel id="send-to-label">Send To</InputLabel>
                        <Select
                            labelId="send-to-label"
                            name="send_to_id"
                            value={
                                formik.values.send_to_id !== null
                                    ? formik.values.send_to_id.toString()
                                    : ''
                            }
                            onChange={handleSendToChange}
                            error={formik.touched.send_to_id && Boolean(formik.errors.send_to_id)}
                            label="Send To"
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
                </Stack>

                <Box display="flex">
                    <Typography variant="h6" gutterBottom>
                        Invoice Items
                    </Typography>
                    <KeybindGuide />
                </Box>

                <FieldArray name="items">
                    {({ push, remove }) => (
                        <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={formik.values.items.map((item, index) => item.id ?? index)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <Stack spacing={1}>
                                        {formik.values.items.map((item, index) => (
                                            <InvoiceItemFields
                                                key={item.id ?? index}
                                                id={item.id ?? index}
                                                index={index}
                                                remove={remove}
                                                totalItems={formik.values.items.length}
                                            />
                                        ))}
                                    </Stack>
                                </SortableContext>
                            </DndContext>

                            {/* Add Item Button */}
                            <Box display="flex" justifyContent="center" mt={0}>
                                <Tooltip title='Add Item' placement='right' arrow>
                                    <IconButton
                                        onClick={() =>
                                            push({
                                                id: Date.now(),
                                                description: '',
                                                quantity: 1,
                                                unit_price: 0,
                                                discount_percentage: 0,
                                                subitems: [],
                                            })
                                        }
                                    >
                                        <AddCircleOutline color='secondary' fontSize='small' />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </>
                    )}
                </FieldArray>

                {/* Tax, Discount, and Notes */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <NumericTextField
                        fullWidth
                        name="tax_rate"
                        label="Tax Rate (%)"
                        value={formik.values.tax_rate}
                        onChange={formik.handleChange}
                        error={formik.touched.tax_rate && Boolean(formik.errors.tax_rate)}
                        helperText={formik.touched.tax_rate && formik.errors.tax_rate}
                        size="small"
                        endAdornment="%"
                    />
                    <NumericTextField
                        fullWidth
                        name="discount_percentage"
                        label="Discount (%)"
                        value={formik.values.discount_percentage}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.discount_percentage &&
                            Boolean(formik.errors.discount_percentage)
                        }
                        helperText={
                            formik.touched.discount_percentage && formik.errors.discount_percentage
                        }
                        size="small"
                        endAdornment="%"
                    />
                </Stack>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="notes"
                    label="Notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                    helperText={formik.touched.notes && formik.errors.notes}
                    size="small"
                />

                <FormControl fullWidth size="small">
                    <InputLabel id="template-select-label">Template</InputLabel>
                    <Select
                        labelId="template-select-label"
                        name="template_id"
                        value={
                            formik.values.template_id !== null
                                ? formik.values.template_id.toString()
                                : ''
                        }
                        onChange={handleTemplateChange}
                        error={formik.touched.template_id && Boolean(formik.errors.template_id)}
                        label="Template"
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

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
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
                    {isEditing && (
                        <Button
                            onClick={handleSaveAsNew}
                            variant="outlined"
                            color="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Save as New'}
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

export default InvoiceForm;
