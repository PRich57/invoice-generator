import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useContacts } from '../hooks/useContacts';
import { deleteContact } from '../services/api/contacts';
import { formatCityStateZip } from '../utils/cityStateZipFormatter';
import { useSnackbar } from 'notistack';
import { useErrorHandler } from '../hooks/useErrorHandler';

const ContactsList: React.FC = () => {
    const navigate = useNavigate();
    const { contacts, error, loading, refetch } = useContacts();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<number | null>(null);
    const { handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();

    const handleEdit = (id: number) => {
        navigate(`/contacts/edit/${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setContactToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (contactToDelete) {
            try {
                await deleteContact(contactToDelete);
                enqueueSnackbar('Contact deleted successfully', { variant: 'success' });
                refetch();
            } catch (err) {
                if (typeof err === 'string') {
                    enqueueSnackbar(err, { variant: 'error' });
                } else {
                    handleError(err);
                }
            }
        }
        setDeleteConfirmOpen(false);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" color="primary">Contacts</Typography>
                <Button
                    id='create-new-contact-button'
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/contacts/new')}
                >
                    Create New Contact
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>City, State ZIP</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                                <TableCell>{contact.name}</TableCell>
                                <TableCell>{contact.company}</TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>{contact.phone}</TableCell>
                                <TableCell>{formatCityStateZip(contact)}</TableCell>
                                <TableCell>
                                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(contact.id)}>
                                        Edit
                                    </Button>
                                    <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(contact.id)}>
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
                content="Are you sure you want to delete this contact?"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirmOpen(false)}
            />
        </Box>
    );
};

export default ContactsList;