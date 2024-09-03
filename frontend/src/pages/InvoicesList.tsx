import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Invoice {
    id: number;
    invoice_number: string;
    bill_to_name: string;
    invoice_date: string;
    total: number;
}

const InvoicesList: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/invoices');
            setInvoices(response.data);
        } catch (error: any) {
            console.error('Error fetching invoices:', error);
            if (error.response && error.response.status === 401) {
                // Redirect to login page if unauthorized
                navigate('/login');
            } else {
                setError('Failed to fetch invoices. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        navigate(`/invoices/edit/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await api.delete(`/invoices/${id}`);
                fetchInvoices(); // Refresh the list after deletion
            } catch (error) {
                console.error('Error deleting invoice:', error);
                setError('Failed to delete invoice. Please try again later.');
            }
        }
    };

    const handleView = (id: number) => {
        navigate(`/invoices/view/${id}`);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Invoices
            </Typography>
            <Button
                variant="contained"
                color="primary"
                style={{ marginBottom: '1rem' }}
                onClick={() => navigate('/invoices/new')}
            >
                Create New Invoice
            </Button>
            {invoices.length === 0 ? (
                <Typography>No invoices found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Invoice Number</TableCell>
                                <TableCell>Bill To</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{invoice.invoice_number}</TableCell>
                                    <TableCell>{invoice.bill_to_name}</TableCell>
                                    <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                                    <TableCell>${invoice.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button startIcon={<ViewIcon />} onClick={() => handleView(invoice.id)}>
                                            View
                                        </Button>
                                        <Button startIcon={<EditIcon />} onClick={() => handleEdit(invoice.id)}>
                                            Edit
                                        </Button>
                                        <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(invoice.id)}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default InvoicesList;