import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Stack, Button, Modal } from '@mui/material';
import { FormikProvider } from 'formik';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { useTemplates } from '../hooks/useTemplates';
import { useContacts } from '../hooks/useContacts';
import { usePDFGeneration } from '../hooks/usePDFGeneration';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoicePreview from '../components/invoices/InvoicePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const InvoiceFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuth();
    const { formik, isLoading, isSubmitting } = useInvoiceForm();
    const { contacts, error: contactsError, loading: contactsLoading } = useContacts();
    const { templates, selectedTemplate, setSelectedTemplate } = useTemplates();
    const { handlePreviewPDF, isGenerating: isPDFGenerating } = usePDFGeneration();
    const { enqueueSnackbar } = useSnackbar();

    const [previewOpen, setPreviewOpen] = useState(false);

    const handlePreview = () => {
        if (selectedTemplate) {
            handlePreviewPDF(formik.values, selectedTemplate, id);
            setPreviewOpen(true);
        }
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
    };

    if (isLoading || contactsLoading) return <LoadingSpinner />;
    if (contactsError) {
        enqueueSnackbar("Failed to load contacts. Please try again.",
            { variant: 'error' }
        );
    }

    return (
        <FormikProvider value={formik}>
            <Typography variant="h4" gutterBottom color="primary">
                {id ? 'Edit Invoice' : 'Create New Invoice'}
            </Typography>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                p: { xs: 2, sm: 3 },
                pb: { xs: 10, sm: 3 }
            }}>
                <Box sx={{ flex: 1, pr: { lg: 2 } }}>
                    <InvoiceForm
                        contacts={contacts}
                        templates={templates}
                        isSubmitting={isSubmitting}
                        setSelectedTemplate={setSelectedTemplate}
                        isAuthenticated={isAuthenticated}
                        handlePreview={handlePreview}
                        isPDFGenerating={isPDFGenerating}
                        selectedTemplate={selectedTemplate}
                    />
                </Box>
                <Box sx={{
                    flex: 1,
                    pl: { lg: 2 },
                    display: { xs: 'none', lg: 'block' }
                }}>
                    {selectedTemplate && (
                        <InvoicePreview
                            invoice={formik.values}
                            template={selectedTemplate}
                            billToContact={contacts.find(c => c.id === formik.values.bill_to_id) || null}
                            sendToContact={contacts.find(c => c.id === formik.values.send_to_id) || null}
                        />
                    )}
                </Box>
            </Box>
        </FormikProvider>
    );
};

export default InvoiceFormPage;