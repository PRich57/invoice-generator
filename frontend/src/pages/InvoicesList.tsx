import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { useInvoices } from '../hooks/useInvoices';
import { deleteInvoice, generateInvoicePDF } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';
import { formatCurrency } from '../utils/currencyFormatter';
import { Invoice } from '../types';

const InvoicesList: React.FC = () => {
    const navigate = useNavigate();
    const { invoices, error, loading, refetch } = useInvoices();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);

    const handleEdit = (id: number) => {
        navigate(`/invoices/edit/${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setInvoiceToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (invoiceToDelete) {
            try {
                await deleteInvoice(invoiceToDelete);
                refetch();
            } catch (err) {
                console.error('Failed to delete invoice:', err);
            }
        }
        setDeleteConfirmOpen(false);
    };

    const handleDownloadPDF = async (invoice: Invoice) => {
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
        } catch (err) {
            console.error('Failed to download PDF:', err);
        }
    };

    if (loading) return <LoadingSpinner />;
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Invoice Number</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Bill To</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Template</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>{invoice.invoice_number}</TableCell>
                                <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                                <TableCell>{invoice.bill_to_id}</TableCell>
                                <TableCell>{formatCurrency(invoice.total)}</TableCell>
                                <TableCell>{invoice.template_id}</TableCell>
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