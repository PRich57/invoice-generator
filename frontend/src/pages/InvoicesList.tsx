import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Add as AddIcon } from '@mui/icons-material';
import { Invoice } from '../types';
import { getInvoices, deleteInvoice } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';
import { format } from 'date-fns';

const InvoicesList: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await getInvoices();
            setInvoices(response.data);
        } catch (err) {
            setError('Failed to fetch invoices. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (id: number) => {
        navigate(`/invoices/${id}`);
    };

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
                setInvoices(invoices.filter(invoice => invoice.id !== invoiceToDelete));
            } catch (err) {
                setError('Failed to delete invoice. Please try again.');
            }
        }
        setDeleteConfirmOpen(false);
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
                    startIcon={<AddIcon />}
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
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>{invoice.invoice_number}</TableCell>
                                <TableCell>{format(new Date(invoice.invoice_date), 'yyyy-MM-dd')}</TableCell>
                                <TableCell>{invoice.bill_to_id}</TableCell>
                                <TableCell>${invoice.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Button startIcon={<ViewIcon />} onClick={() => handleView(invoice.id)}>
                                        View
                                    </Button>
                                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(invoice.id)}>
                                        Edit
                                    </Button>
                                    <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(invoice.id)}>
                                        Delete
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