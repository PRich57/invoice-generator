import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Stack,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/currencyFormatter';
import dayjs from 'dayjs';

interface InvoiceListProps {
    invoices: Invoice[];
    contacts: Record<number, string>;
    templates: Record<number, string>;
    isMobile: boolean;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onDownloadPDF: (invoice: Invoice) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (column: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
    invoices,
    contacts,
    templates,
    isMobile,
    onEdit,
    onDelete,
    onDownloadPDF,
    sortBy,
    sortOrder,
    onSort,
}) => {
    if (isMobile) {
        return (
            <Stack spacing={2}>
                {invoices.map((invoice) => (
                    <Card key={invoice.id}>
                        <CardContent>
                            <Typography variant="h6">Invoice #{invoice.invoice_number}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                Date: {dayjs(invoice.invoice_date).format('MM/DD/YYYY')}
                            </Typography>
                            <Typography variant="body2">
                                Bill To: {contacts[invoice.bill_to_id] || 'Unknown'}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                Total: {formatCurrency(invoice.total)}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(invoice.id)}>
                                Edit
                            </Button>
                            <Button size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(invoice.id)}>
                                Delete
                            </Button>
                            <Button size="small" startIcon={<PdfIcon />} onClick={() => onDownloadPDF(invoice)}>
                                PDF
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Stack>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell onClick={() => onSort('invoice_number')} sx={{ cursor: 'pointer' }}>
                            Invoice Number {sortBy === 'invoice_number' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableCell>
                        <TableCell onClick={() => onSort('date')} sx={{ cursor: 'pointer' }}>
                            Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableCell>
                        <TableCell onClick={() => onSort('bill_to_name')} sx={{ cursor: 'pointer' }}>
                            Bill To {sortBy === 'bill_to_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableCell>
                        <TableCell onClick={() => onSort('total')} sx={{ cursor: 'pointer' }}>
                            Total {sortBy === 'total' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableCell>
                        <TableCell onClick={() => onSort('template_name')} sx={{ cursor: 'pointer' }}>
                            Template {sortBy === 'template_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell>{invoice.invoice_number}</TableCell>
                            <TableCell>{dayjs(invoice.invoice_date).format('MM/DD/YYYY')}</TableCell>
                            <TableCell>{contacts[invoice.bill_to_id] || 'Unknown'}</TableCell>
                            <TableCell>{formatCurrency(invoice.total)}</TableCell>
                            <TableCell>{templates[invoice.template_id] || 'Unknown'}</TableCell>
                            <TableCell>
                                <IconButton onClick={() => onEdit(invoice.id)} size="small">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => onDelete(invoice.id)} size="small">
                                    <DeleteIcon />
                                </IconButton>
                                <IconButton onClick={() => onDownloadPDF(invoice)} size="small">
                                    <PdfIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InvoiceList;