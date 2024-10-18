import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { FormikProvider } from 'formik';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { useTemplates } from '../hooks/useTemplates';
import { useContacts } from '../hooks/useContacts';
import { usePDFGeneration } from '../hooks/usePDFGeneration';
import InvoiceForm from '../components/invoices/form/InvoiceForm';
import InvoicePreview from '../components/invoices/form/InvoicePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const InvoiceFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { formik, isLoading, isSubmitting } = useInvoiceForm();
    const { contacts, error: contactsError, loading: contactsLoading } = useContacts();
    const { templates, selectedTemplate, setSelectedTemplate } = useTemplates();
    const { handlePreviewPDF, isGenerating: isPDFGenerating } = usePDFGeneration();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            <Box sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant={isMobile ? "h5" : "h4"} gutterBottom color="primary" sx={{ mb: 3 }}>
                    {id ? 'Edit Invoice' : 'Create New Invoice'}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
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
                            isEditing={!!id}
                            isMobile={isMobile}
                        />
                    </Box>
                    {!isMobile && selectedTemplate && (
                        <Box sx={{
                            flex: 1,
                            pl: { lg: 2 },
                            display: { xs: 'none', lg: 'block' }
                        }}>
                            <InvoicePreview
                                invoice={formik.values}
                                template={selectedTemplate}
                                billToContact={contacts.find(c => c.id === formik.values.bill_to_id) || null}
                                sendToContact={contacts.find(c => c.id === formik.values.send_to_id) || null}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </FormikProvider>
    );
};

export default InvoiceFormPage;