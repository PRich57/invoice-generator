import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Template } from '../types';
import { getTemplates, deleteTemplate } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';
import { useFetch } from '../hooks/useFetch';

const TemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const { data: templates, isLoading, error, refetch } = useFetch<Template[]>('/templates');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [templateToDelete, setTemplateToDelete] = React.useState<number | null>(null);

    const handleEdit = (id: number) => {
        navigate(`/templates/edit/${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setTemplateToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (templateToDelete) {
            try {
                await deleteTemplate(templateToDelete);
                refetch();
            } catch (err) {
                console.error('Failed to delete template:', err);
            }
        }
        setDeleteConfirmOpen(false);
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Templates
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/templates/new')}
                style={{ marginBottom: '1rem' }}
            >
                Create New Template
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {templates?.map((template) => (
                            <TableRow key={template.id}>
                                <TableCell>{template.name}</TableCell>
                                <TableCell>
                                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(template.id)}>
                                        Edit
                                    </Button>
                                    <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(template.id)}>
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
                content="Are you sure you want to delete this template?"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirmOpen(false)}
            />
        </div>
    );
};

export default TemplatesList;