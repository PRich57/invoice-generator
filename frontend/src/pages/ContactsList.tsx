// src/pages/ContactsList.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useContacts } from '../hooks/useContacts';
import { deleteContact } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';

const ContactsList: React.FC = () => {
    const navigate = useNavigate();
    const { contacts, error, loading, refetch } = useContacts();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<number | null>(null);

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
                refetch();
            } catch (err) {
                console.error('Failed to delete contact:', err);
            }
        }
        setDeleteConfirmOpen(false);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Contacts
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/contacts/new')}
                style={{ marginBottom: '1rem' }}
            >
                Add New Contact
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>City</TableCell>
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
                                <TableCell>{contact.city}</TableCell>
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
        </div>
    );
};

export default ContactsList;