import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { FormikProvider } from 'formik';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { useTemplates } from '../hooks/useTemplates';
import { useContacts } from '../hooks/useContacts';
import { usePDFGeneration } from '../hooks/usePDFGeneration';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoicePreview from '../components/invoices/InvoicePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';

const InvoiceFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuth();
    const { formik, isLoading, isSubmitting } = useInvoiceForm();
    const { contacts, error: contactsError, loading: contactsLoading } = useContacts();
    const { templates, selectedTemplate, setSelectedTemplate } = useTemplates();
    const { handlePreviewPDF, isGenerating: isPDFGenerating } = usePDFGeneration();

    const handlePreview = () => {
        if (selectedTemplate) {
            handlePreviewPDF(formik.values, selectedTemplate, id);
        }
    };

    if (isLoading || contactsLoading) return <LoadingSpinner />;
    if (contactsError)
        return <ErrorMessage message={contactsError || 'An error occurred'} />;

    return (
        <FormikProvider value={formik}>
            <Box display="flex" flexDirection="column">
                <Typography variant="h4" gutterBottom>
                    {id ? 'Edit Invoice' : 'Create New Invoice'}
                </Typography>
                <Box display="flex" flexDirection="row">
                    <Box sx={{ flex: 1, pr: 2 }}>
                        <InvoiceForm
                            contacts={contacts}
                            templates={templates}
                            isSubmitting={isSubmitting}
                            setSelectedTemplate={setSelectedTemplate}
                        />
                        <Box mt={2} display="flex" gap={2}>
                            {isAuthenticated && (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Save Invoice'}
                                </Button>
                            )}
                            <Button
                                onClick={handlePreview}
                                variant="outlined"
                                color="secondary"
                                disabled={isPDFGenerating || !selectedTemplate}
                            >
                                {isPDFGenerating ? 'Generating PDF...' : 'PDF Preview'}
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1, pl: 2 }}>
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
            </Box>
        </FormikProvider>
    );
};

export default InvoiceFormPage;
