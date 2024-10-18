import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { useTemplateForm } from '../hooks/useTemplateForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TemplateForm from '../components/templates/TemplateForm';

const TemplateFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { formik, isLoading, isSubmitting } = useTemplateForm();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (isLoading) return <LoadingSpinner />;

    return (
        <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom color="primary" sx={{ mb: 3 }}>
                {id ? 'Edit Template' : 'Create New Template'}
            </Typography>
            <TemplateForm
                formik={formik}
                isSubmitting={isSubmitting}
                isMobile={isMobile}
            />
        </Box>
    );
};

export default TemplateFormPage;