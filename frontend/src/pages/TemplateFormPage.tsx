import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import { useTemplateForm } from '../hooks/useTemplateForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TemplateForm from '../components/templates/TemplateForm';

const TemplateFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { formik, isLoading, isSubmitting } = useTemplateForm();

    if (isLoading) return <LoadingSpinner />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom color="primary">
                {id ? 'Edit Template' : 'Create New Template'}
            </Typography>
            <TemplateForm
                formik={formik}
                isSubmitting={isSubmitting}
            />
        </Box>
    );
};

export default TemplateFormPage;