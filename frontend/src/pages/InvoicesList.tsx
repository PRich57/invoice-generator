import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, TextField, FormControl, Select, MenuItem, Chip, InputLabel, SelectChangeEvent, OutlinedInput, Checkbox, ListItemText } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { useInvoices } from '../hooks/useInvoices';
import { deleteInvoice, generateInvoicePDF, getContacts, getTemplates } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';
import { formatCurrency } from '../utils/currencyFormatter';
import { Invoice } from '../types';
import { useSnackbar } from 'notistack';
import { useErrorHandler } from '../hooks/useErrorHandler';

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
                console.error('Failed to fetch contacts or templates:', err);
            }
        };
        fetchData();
    }, []);

    const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        updateFilters({ [name]: value });
    }, [updateFilters]);

    const handleSort = useCallback((column: string) => {
        updateSorting(column);
    }, [updateSorting]);

    const handleGroup = useCallback((event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        updateGrouping(typeof value === 'string' ? value.split(',') : value);
    }, [updateGrouping]);

    const handleEdit = useCallback((id: number) => {
        navigate(`/invoices/edit/${id}`);
    }, [navigate]);

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
    }, [invoiceToDelete, deleteInvoice, enqueueSnackbar, fetchInvoices, handleError]);

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

    const renderInvoices = useMemo(() => {
        return invoices.map((invoice) => (
            <TableRow key={invoice.id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
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
    }, [invoices, contacts, templates, handleEdit, handleDeleteClick, handleDownloadPDF]);

    if (loading && invoices.length === 0) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">Invoices</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/invoices/new')}
                >
                    Create New Invoice
                </Button>
            </Box>

            <Box mb={2}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Group By</InputLabel>
                    <Select
                        multiple
                        value={groupBy}
                        onChange={handleGroup}
                        input={<OutlinedInput label="Group By" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as string[]).map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {['bill_to', 'month', 'year'].map((option) => (
                            <MenuItem key={option} value={option}>
                                <Checkbox checked={groupBy.indexOf(option) > -1} />
                                <ListItemText primary={option} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box mb={2}>
                <TextField
                    name="invoice_number"
                    label="Invoice Number"
                    value={filters.invoice_number}
                    onChange={handleFilterChange}
                    sx={{ mr: 2 }}
                />
                <TextField
                    name="bill_to_name"
                    label="Bill To Name"
                    value={filters.bill_to_name}
                    onChange={handleFilterChange}
                    sx={{ mr: 2 }}
                />
                <TextField
                    name="total_min"
                    label="Min Total"
                    type="number"
                    value={filters.total_min || ''}
                    onChange={handleFilterChange}
                />
                <TextField
                    name="total_max"
                    label="Max Total"
                    type="number"
                    value={filters.total_max || ''}
                    onChange={handleFilterChange}
                    sx={{ mr: 2 }}
                />
                <TextField
                    name="date_from"
                    label="From Date"
                    type="date"
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    value={filters.date_from}
                    onChange={handleFilterChange}
                    sx={{ minWidth: 180 }}
                />
                <TextField
                    name="date_to"
                    label="To Date"
                    type="date"
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    value={filters.date_to}
                    onChange={handleFilterChange}
                    sx={{ minWidth: 180 }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell onClick={() => handleSort('invoice_number')}>
                                Invoice Number {sortBy === 'invoice_number' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell onClick={() => handleSort('date')}>
                                Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell onClick={() => handleSort('bill_to_name')}>
                                Bill To {sortBy === 'bill_to_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell onClick={() => handleSort('total')}>
                                Total {sortBy === 'total' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableCell>
                            <TableCell>Template</TableCell>
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