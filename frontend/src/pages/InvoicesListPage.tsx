import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Stack,
    useTheme,
    useMediaQuery,
    SelectChangeEvent,
} from '@mui/material';
import { useInvoices } from '../hooks/useInvoices';
import { deleteInvoice, generateInvoicePDF } from '../services/api/invoices';
import { getContacts } from '../services/api/contacts';
import { getTemplates } from '../services/api/templates';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';
import { Invoice } from '../types';
import { useSnackbar } from 'notistack';
import { useErrorHandler } from '../hooks/useErrorHandler';
import dayjs from 'dayjs';
import InvoiceList from '../components/invoices/InvoiceList';
import MobileInvoiceFilters from '../components/invoices/MobileInvoiceFilters';
import MobileGroupControls from '../components/invoices/MobileGroupControls';
import { formatCurrency } from '../utils/currencyFormatter';
import Pagination from '../components/common/CustomPagination';

const InvoicesList: React.FC = () => {
    const navigate = useNavigate();
    const {
        invoices,
        error,
        loading,
        fetchInvoices,
        updateSorting,
        updateGrouping,
        updateFilters,
        sortBy,
        sortOrder,
        groupBy,
        filters,
        page,
        pageSize,
        totalCount,
        updatePage,
        updatePageSize
    } = useInvoices();

    const [contacts, setContacts] = useState<Record<number, string>>({});
    const [templates, setTemplates] = useState<Record<number, string>>({});
    const { handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                enqueueSnackbar('Failed to fetch contacts and/or templates. Please try again.',
                    { variant: 'error' }
                );
            }
        };
        fetchData();
    }, [enqueueSnackbar]);

    const handlePageChange = useCallback((newPage: number) => {
        updatePage(newPage);
    }, [updatePage]);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        updatePageSize(newPageSize);
    }, [updatePageSize]);

    const handleFilterChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
            const { name, value } = event.target;
            updateFilters({ [name]: value });
        }, [updateFilters]);

    const handleDateChange = useCallback((field: 'date_from' | 'date_to', value: string | null) => {
        updateFilters({ [field]: value });
    }, [updateFilters]);

    const handleUpdateGrouping = useCallback((values: string[]) => {
        updateGrouping(values);
    }, [updateGrouping]);

    const groupedInvoices = useMemo(() => {
        if (groupBy.length === 0) return null;
    
        const grouped: any = {};
        invoices.forEach((invoice) => {
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
    
            if (!grouped[key]) {
                grouped[key] = {
                    invoices: [],
                    invoice_count: 0,
                    total_amount: 0
                };
            }
    
            grouped[key].invoices.push(invoice);
            grouped[key].invoice_count += 1;
            grouped[key].total_amount += parseFloat(invoice.total.toString());
        });
    
        return grouped;
    }, [invoices, groupBy, contacts]);

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

    // Get active filters for display
    const activeFilters = Object.entries(filters).filter(([_, value]) => value !== '' && value !== undefined);

    const handleRemoveFilter = useCallback((key: string) => {
        updateFilters({ [key]: undefined });
    }, [updateFilters]);

    if (loading && invoices.length === 0) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" color='primary'>Invoices</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/invoices/new')}
                >
                    Create New Invoice
                </Button>
            </Stack>

            {/* Filter and Group Controls */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <MobileInvoiceFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onDateChange={handleDateChange}
                    onQuickFilter={updateFilters}
                    activeFilters={activeFilters}
                    onRemoveFilter={handleRemoveFilter}
                />

                <MobileGroupControls
                    groupBy={groupBy}
                    onUpdateGrouping={handleUpdateGrouping}
                />
            </Stack>

            {/* Grouped or Regular Invoice List */}
            {groupedInvoices ? (
                Object.entries(groupedInvoices).map(([group, data]: [string, any]) => (
                    <Box key={group} sx={{ mb: 4 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            {group}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                            {data.invoice_count} invoices, Total: {formatCurrency(data.total_amount)}
                        </Typography>
                        <InvoiceList
                            invoices={data.invoices}
                            contacts={contacts}
                            templates={templates}
                            isMobile={isMobile}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onDownloadPDF={handleDownloadPDF}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={updateSorting}
                        />
                    </Box>
                ))
            ) : (
                <>
                    <InvoiceList
                        invoices={invoices}
                        contacts={contacts}
                        templates={templates}
                        isMobile={isMobile}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onDownloadPDF={handleDownloadPDF}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={updateSorting}
                    />
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Pagination
                            page={page}
                            pageSize={pageSize}
                            totalItems={totalCount}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            isMobile={isMobile}
                        />
                    </Box>
                </>
            )}

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