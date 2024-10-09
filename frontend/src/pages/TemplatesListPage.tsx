import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTemplates } from '../hooks/useTemplates';
import { deleteTemplate } from '../services/api/templates';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationDialog from '../components/common/ConfirmationDialogue';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useSnackbar } from 'notistack';

const TemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const { templates, error, loading, refetch } = useTemplates();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
    const { handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();

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
                enqueueSnackbar('Template deleted successfully', { variant: 'success' });
                refetch();
            } catch (err) {
                handleError(err);
            }
        }
        setDeleteConfirmOpen(false);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" color="primary">Templates</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/templates/new')}
                >
                    Create New Template
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Main Font</TableCell>
                            <TableCell>Header Font Size</TableCell>
                            <TableCell>Body Font Size</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {templates.map((template) => (
                            <TableRow key={template.id}>
                                <TableCell>{template.name}</TableCell>
                                <TableCell>{template.fonts.main}</TableCell>
                                <TableCell>{template.font_sizes.section_header}</TableCell>
                                <TableCell>{template.font_sizes.normal_text}</TableCell>
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
        </Box>
    );
};

export default TemplatesList;