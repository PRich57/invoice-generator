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
            <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 10, sm: 3 } }}>
                <Typography variant="h4" gutterBottom>
                    {id ? 'Edit Invoice' : 'Create New Invoice'}
                </Typography>
                <Box>
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
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handlePreview}
                    disabled={!selectedTemplate || isPDFGenerating}
                >
                    {isPDFGenerating ? 'Generating Preview...' : 'Preview Invoice'}
                </Button>
            </Stack>

            <Modal
                open={previewOpen}
                onClose={handleClosePreview}
                aria-labelledby="invoice-preview-modal"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box sx={{ 
                    bgcolor: 'background.paper', 
                    boxShadow: 24, 
                    p: 4, 
                    width: '90%', 
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    {selectedTemplate && (
                        <InvoicePreview
                            invoice={formik.values}
                            template={selectedTemplate}
                            billToContact={contacts.find(c => c.id === formik.values.bill_to_id) || null}
                            sendToContact={contacts.find(c => c.id === formik.values.send_to_id) || null}
                        />
                    )}
                    <Button onClick={handleClosePreview} sx={{ mt: 2 }}>Close Preview</Button>
                </Box>
            </Modal>
        </FormikProvider>
    );
};

export default InvoiceFormPage;