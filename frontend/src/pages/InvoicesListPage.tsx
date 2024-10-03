import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Typography, Box, TextField, FormControl, Select, MenuItem,
    Chip, InputLabel, SelectChangeEvent, OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { useInvoices } from '../hooks/useInvoices';
import { deleteInvoice, generateInvoicePDF } from '../services/api/invoices';
import { getContacts } from '../services/api/contacts';
import { getTemplates } from '../services/api/templates';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';
import { formatCurrency } from '../utils/currencyFormatter';
import { Invoice, GroupedInvoices } from '../types';
import { useSnackbar } from 'notistack';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

const InvoicesList: React.FC = () => {
    const navigate = useNavigate();
    const {
        invoices, error, loading, fetchInvoices,
        updateSorting, updateGrouping, updateFilters,
        sortBy, sortOrder, groupBy, filters
    } = useInvoices();
    const [contacts, setContacts] = useState<Record<number, string>>({});
    const [templates, setTemplates] = useState<Record<number, string>>({});
    const { handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contactsData = await getContacts();
                const templatesData = await getTemplates();

                setContacts(
                    contactsData.reduce((acc, contact) => {
                        acc[contact.id] = contact.name;
                        return acc;
                    }, {} as Record<number, string>)
                );

                setTemplates(
                    templatesData.reduce((acc, template) => {
                        acc[template.id] = template.name;
                        return acc;
                    }, {} as Record<number, string>)
                );
            } catch (err) {
                // console.error('Failed to fetch contacts or templates:', err);
                enqueueSnackbar('Failed to fetch contacts and/or templates. Please try again.',
                    { variant: 'error' }
                )
            }
        };
        fetchData();
    }, []);

    const handleFilterChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        updateFilters({ [name]: value });
    }, [updateFilters]);

    const handleGroup = useCallback((event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        updateGrouping(typeof value === 'string' ? value.split(',') : value);
    }, [updateGrouping]);

    const handleSort = useCallback((column: string) => {
        updateSorting(column);
    }, [updateSorting]);

    const handleEdit = useCallback((id: number) => {
        navigate(`/invoices/edit/${id}`);
    }, [navigate]);

    const handleDateChange = useCallback((dateType: 'date_from' | 'date_to') => (newValue: dayjs.Dayjs | null) => {
        if (newValue) {
            updateFilters({ [dateType]: newValue.format('YYYY-MM-DD') });
        } else {
            updateFilters({ [dateType]: undefined });
        }
    }, [updateFilters]);

    const handleDeleteClick = useCallback((id: number) => {
        setInvoiceToDelete(id);
        setDeleteConfirmOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (invoiceToDelete) {
            try {
                await deleteInvoice(invoiceToDelete);
                enqueueSnackbar('Invoice deleted successfully', { variant: 'success' });
                fetchInvoices();
            } catch (err) {
                handleError(err);
            }
        }
        setDeleteConfirmOpen(false);
    }, [invoiceToDelete, enqueueSnackbar, fetchInvoices, handleError]);

    const handleDownloadPDF = useCallback(async (invoice: Invoice) => {
        try {
            const response = await generateInvoicePDF(invoice.id, invoice.template_id);
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${invoice.invoice_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            enqueueSnackbar('Invoice PDF generated successfully', { variant: 'success' });
        } catch (err) {
            handleError(err);
        }
    }, [enqueueSnackbar, handleError]);

    const groupOptions = [
        { value: 'bill_to', label: 'Bill To' },
        { value: 'send_to', label: 'Send To' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' },
        { value: 'status', label: 'Status' },
        { value: 'client_type', label: 'Client Type' },
        { value: 'invoice_type', label: 'Invoice Type' },
    ];

    const renderInvoices = useMemo(() => {
        // If grouped, render grouped data
        if (groupBy.length > 0) {
            const grouped: GroupedInvoices = invoices.reduce((acc: GroupedInvoices, invoice: Invoice) => {
                let key = 'Others';
                if (groupBy.includes('bill_to')) {
                    key = contacts[invoice.bill_to_id] || 'Unknown';
                } else if (groupBy.includes('send_to')) {
                    key = contacts[invoice.send_to_id] || 'Unknown';
                } else if (groupBy.includes('month')) {
                    key = dayjs(invoice.invoice_date).format('MMMM');
                } else if (groupBy.includes('year')) {
                    key = dayjs(invoice.invoice_date).format('YYYY');
                } else if (groupBy.includes('status')) {
                    key = invoice.status || 'Unknown';
                } else if (groupBy.includes('client_type')) {
                    key = invoice.client_type || 'Unknown';
                } else if (groupBy.includes('invoice_type')) {
                    key = invoice.invoice_type || 'Unknown';
                }

                if (!acc[key]) acc[key] = { invoice_count: 0, total_amount: 0 };
                acc[key].invoice_count += 1;
                acc[key].total_amount += parseFloat(invoice.total.toString());
                return acc;
            }, {});

            return Object.entries(grouped).map(([group, data]) => (
                <React.Fragment key={`group-${group}`}>
                    <TableRow>
                        <TableCell colSpan={6}>
                            <Typography variant="h6">
                                {group} &nbsp;
                                <Typography variant="subtitle2" component="span">
                                    ({data.invoice_count} invoices, Total: {formatCurrency(data.total_amount)})
                                </Typography>
                            </Typography>
                        </TableCell>
                    </TableRow>
                    {invoices.filter(invoice => {
                        let key = 'Others';
                        if (groupBy.includes('bill_to')) {
                            key = contacts[invoice.bill_to_id] || 'Unknown';
                        } else if (groupBy.includes('send_to')) {
                            key = contacts[invoice.send_to_id] || 'Unknown';
                        } else if (groupBy.includes('month')) {
                            key = dayjs(invoice.invoice_date).format('MMMM');
                        } else if (groupBy.includes('year')) {
                            key = dayjs(invoice.invoice_date).format('YYYY');
                        } else if (groupBy.includes('status')) {
                            key = invoice.status || 'Unknown';
                        } else if (groupBy.includes('client_type')) {
                            key = invoice.client_type || 'Unknown';
                        } else if (groupBy.includes('invoice_type')) {
                            key = invoice.invoice_type || 'Unknown';
                        }
                        return key === group;
                    }).map((invoice: Invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell>{invoice.invoice_number}</TableCell>
                            <TableCell>{dayjs(invoice.invoice_date).format('MM/DD/YYYY')}</TableCell>
                            <TableCell>{contacts[invoice.bill_to_id] || 'Unknown'}</TableCell>
                            <TableCell>{formatCurrency(invoice.total)}</TableCell>
                            <TableCell>{templates[invoice.template_id] || 'Unknown'}</TableCell>
                            <TableCell>
                                <Button startIcon={<EditIcon />} onClick={() => handleEdit(invoice.id)}>
                                    Edit
                                </Button>
                                <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(invoice.id)}>
                                    Delete
                                </Button>
                                <Button startIcon={<PdfIcon />} onClick={() => handleDownloadPDF(invoice)}>
                                    Download PDF
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </React.Fragment>
            ));
        }

        // Default rendering without grouping
        return invoices.map((invoice: Invoice) => (
            <TableRow key={invoice.id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{dayjs(invoice.invoice_date).format('MM/DD/YYYY')}</TableCell>
                <TableCell>{contacts[invoice.bill_to_id] || 'Unknown'}</TableCell>
                <TableCell>{formatCurrency(invoice.total)}</TableCell>
                <TableCell>{templates[invoice.template_id] || 'Unknown'}</TableCell>
                <TableCell>
                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(invoice.id)}>
                        Edit
                    </Button>
                    <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(invoice.id)}>
                        Delete
                    </Button>
                    <Button startIcon={<PdfIcon />} onClick={() => handleDownloadPDF(invoice)}>
                        Download PDF
                    </Button>
                </TableCell>
            </TableRow>
        ));
    }, [invoices, groupBy, contacts, templates, handleEdit, handleDeleteClick, handleDownloadPDF]);

    if (loading && invoices.length === 0) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">Invoices</Typography>
                <Button
                    id='create-new-invoice-button'
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/invoices/new')}
                >
                    Create New Invoice
                </Button>
            </Box>

            <Box mb={2} display="flex" flexDirection="column" gap={2}>
                {/* Group By */}
                <FormControl fullWidth>
                    <InputLabel>Group By</InputLabel>
                    <Select
                        multiple
                        name="groupBy"
                        value={groupBy}
                        onChange={handleGroup}
                        input={<OutlinedInput label="Group By" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as string[]).map((value) => (
                                    <Chip key={value} label={groupOptions.find(opt => opt.value === value)?.label || value} />
                                ))}
                            </Box>
                        )}
                    >
                        {groupOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                <Checkbox checked={groupBy.indexOf(option.value) > -1} />
                                <ListItemText primary={option.label} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Filters */}
                <Box display="flex" flexWrap="wrap" gap={2}>
                    <TextField
                        name="invoice_number"
                        label="Invoice Number"
                        value={filters.invoice_number}
                        onChange={handleFilterChange}
                        sx={{ minWidth: 200 }}
                    />
                    <TextField
                        name="bill_to_name"
                        label="Bill To Name"
                        value={filters.bill_to_name}
                        onChange={handleFilterChange}
                        sx={{ minWidth: 200 }}
                    />
                    <TextField
                        name="send_to_name"
                        label="Send To Name"
                        value={filters.send_to_name}
                        onChange={handleFilterChange}
                        sx={{ minWidth: 200 }}
                    />
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Client Type</InputLabel>
                        <Select
                            name="client_type"
                            value={filters.client_type}
                            onChange={handleFilterChange}
                            label="Client Type"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                            <MenuItem value="BUSINESS">Business</MenuItem>
                            {/* Add more client types as needed */}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Invoice Type</InputLabel>
                        <Select
                            name="invoice_type"
                            value={filters.invoice_type}
                            onChange={handleFilterChange}
                            label="Invoice Type"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="SERVICE">Service</MenuItem>
                            <MenuItem value="PRODUCT">Product</MenuItem>
                            {/* Add more invoice types as needed */}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            label="Status"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="PAID">Paid</MenuItem>
                            <MenuItem value="UNPAID">Unpaid</MenuItem>
                            <MenuItem value="OVERDUE">Overdue</MenuItem>
                            {/* Add more statuses as needed */}
                        </Select>
                    </FormControl>
                    <TextField
                        name="total_min"
                        label="Min Total"
                        type="number"
                        value={filters.total_min || ''}
                        onChange={handleFilterChange}
                        sx={{ minWidth: 150 }}
                    />
                    <TextField
                        name="total_max"
                        label="Max Total"
                        type="number"
                        value={filters.total_max || ''}
                        onChange={handleFilterChange}
                        sx={{ minWidth: 150 }}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="From Date"
                            value={filters.date_from ? dayjs(filters.date_from) : null}
                            onChange={handleDateChange('date_from')}
                            slotProps={{ textField: { sx: { minWidth: 180 } } }}
                        />
                        <DatePicker
                            label="To Date"
                            value={filters.date_to ? dayjs(filters.date_to) : null}
                            onChange={handleDateChange('date_to')}
                            slotProps={{ textField: { sx: { minWidth: 180 } } }}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell onClick={() => handleSort('invoice_number')} sx={{ cursor: 'pointer' }}>
                                Invoice Number {sortBy === 'invoice_number' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell onClick={() => handleSort('date')} sx={{ cursor: 'pointer' }}>
                                Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell onClick={() => handleSort('bill_to_name')} sx={{ cursor: 'pointer' }}>
                                Bill To {sortBy === 'bill_to_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell onClick={() => handleSort('total')} sx={{ cursor: 'pointer' }}>
                                Total {sortBy === 'total' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell onClick={() => handleSort('template_name')} sx={{ cursor: 'pointer' }}>
                                Template {sortBy === 'template_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {renderInvoices}
                    </TableBody>
                </Table>
            </TableContainer>
            <ConfirmationDialog
                open={deleteConfirmOpen}
                title="Confirm Delete"
                content="Are you sure you want to delete this invoice?"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirmOpen(false)}
            />
        </Box>
    );

};

export default InvoicesList;