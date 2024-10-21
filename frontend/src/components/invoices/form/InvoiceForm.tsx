import React, { useEffect, useCallback } from 'react';
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
import { InvoiceCreate, InvoiceFormProps } from '../../../types';
import InvoiceItemFields from './InvoiceItemFields';
import { formatDateForAPI } from '../../../utils/dateFormatter';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import NumericTextField from '../../common/NumericTextField';
import { createInvoice, getNextInvoiceNumber } from '../../../services/api/invoices';
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
    isMobile,
    templatesLoading,
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

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
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
        },
        [formik]
    );

    const handleTemplateChange = useCallback(
        (event: SelectChangeEvent<string>) => {
            const value = event.target.value;
            const templateId = value === '' ? null : Number(value);
            formik.setFieldValue('template_id', templateId);
            const selected = templates.find((t) => t.id === templateId) || null;
            setSelectedTemplate(selected);
        },
        [formik, templates, setSelectedTemplate]
    );

    const handleBillToChange = useCallback(
        (event: SelectChangeEvent<string>) => {
            const value = event.target.value;
            const billToId = value === '' ? null : Number(value);
            formik.setFieldValue('bill_to_id', billToId);
        },
        [formik]
    );

    const handleSendToChange = useCallback(
        (event: SelectChangeEvent<string>) => {
            const value = event.target.value;
            const sendToId = value === '' ? null : Number(value);
            formik.setFieldValue('send_to_id', sendToId);
        },
        [formik]
    );

    const handleDateChange = useCallback(
        (newValue: dayjs.Dayjs | null) => {
            if (newValue) {
                formik.setFieldValue('invoice_date', formatDateForAPI(newValue.toDate()));
            }
        },
        [formik]
    );

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
    useEffect(() => {
        const updatedItems = formik.values.items.map((item) => {
            if (!item.id) {
                return { ...item, id: Math.floor(Date.now() + Math.random()) };
            }
            return item;
        });
        formik.setFieldValue('items', updatedItems);
    }, []);

    useEffect(() => {
        if (!templatesLoading && templates.length > 0 && !formik.values.template_id) {
            const defaultTemplate = templates.find(t => t.id === 1) || templates[0];
            formik.setFieldValue('template_id', defaultTemplate.id);
            setSelectedTemplate(defaultTemplate);
        }
    }, [templatesLoading, templates, formik.values.template_id, formik.setFieldValue, setSelectedTemplate]);

    const handleNumericChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        formik.setFieldValue(field, value === '' ? 0 : Number(value));
    };

    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            <Stack spacing={isMobile ? 2 : 3}>
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
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: 'small',
                                    error:
                                        formik.touched.invoice_date &&
                                        Boolean(formik.errors.invoice_date),
                                    helperText:
                                        formik.touched.invoice_date && formik.errors.invoice_date,
                                },
                            }}
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
                    {!isMobile && <KeybindGuide />}
                </Box>

                <FieldArray name="items">
                    {({ push, remove, insert }) => (
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
                                    <Stack spacing={isMobile ? 3 : 1}>
                                        {formik.values.items.map((item, index) => (
                                            <InvoiceItemFields
                                                key={item.id ?? index}
                                                id={item.id ?? index}
                                                index={index}
                                                remove={remove}
                                                insert={insert}
                                                totalItems={formik.values.items.length}
                                                isMobile={isMobile}
                                                item={item}
                                                items={formik.values.items}
                                                setFieldValue={formik.setFieldValue}
                                            />
                                        ))}
                                    </Stack>
                                </SortableContext>
                            </DndContext>

                            {/* Add Item Button */}
                            <Box display="flex" justifyContent="center" mt={2}>
                                <Tooltip
                                    title="Add Item"
                                    placement="right"
                                    arrow
                                    sx={{
                                        opacity: '100%',
                                    }}
                                >
                                    <IconButton
                                        aria-label="Add Item"
                                        onClick={() =>
                                            push({
                                                id: Math.floor(Date.now() + Math.random()),
                                                description: '',
                                                quantity: 1,
                                                unit_price: 0,
                                                discount_percentage: 0,
                                                subitems: [],
                                            })
                                        }
                                    >
                                        <AddCircleOutline color="secondary" fontSize="small" />
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
                        value={formik.values.tax_rate}
                        name="tax_rate"
                        label="Tax Rate (%)"
                        onChange={handleNumericChange('tax_rate')}
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
                        onChange={handleNumericChange('discount_percentage')}
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
                        disabled={templatesLoading}
                    >
                        {templatesLoading ? (
                            <MenuItem value="">Loading templates...</MenuItem>
                        ) : (
                            templates.map((template) => (
                                <MenuItem key={template.id} value={template.id.toString()}>
                                    {template.name}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>

                {/* Action Buttons */}
                <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
                    {isAuthenticated && (
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? 'medium' : 'large'}
                        >
                            {isSubmitting ? 'Submitting...' : 'Save Invoice'}
                        </Button>
                    )}
                    <Button
                        onClick={handlePreview}
                        variant="outlined"
                        color="secondary"
                        disabled={isPDFGenerating || !selectedTemplate}
                        fullWidth={isMobile}
                        size={isMobile ? 'medium' : 'large'}
                    >
                        {isPDFGenerating ? 'Generating PDF...' : 'PDF Preview'}
                    </Button>
                    {isEditing && (
                        <Button
                            onClick={handleSaveAsNew}
                            variant="outlined"
                            color="primary"
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? 'medium' : 'large'}
                        >
                            {isSubmitting ? 'Submitting...' : 'Save as New'}
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

export default React.memo(InvoiceForm);
