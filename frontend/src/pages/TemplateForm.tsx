import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TemplateCreate } from '../types';
import { createTemplate, getTemplate, updateTemplate } from '../services/api';
import ErrorMessage from '../components/common/ErrorMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Template name is required'),
    content: Yup.string(),
    font_family: Yup.string().required('Font family is required'),
    font_size: Yup.number().required('Font size is required').positive('Font size must be positive'),
    primary_color: Yup.string().required('Primary color is required'),
    secondary_color: Yup.string().required('Secondary color is required'),
    logo_url: Yup.string().url('Logo URL must be a valid URL'),
    custom_css: Yup.string(),
});

const TemplateForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const formik = useFormik<TemplateCreate>({
        initialValues: {
            name: '',
            content: '',
            font_family: 'Helvetica',
            font_size: 12,
            primary_color: '#000000',
            secondary_color: '#ffffff',
            logo_url: '',
            custom_css: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError(null);
            try {
                if (id) {
                    await updateTemplate(parseInt(id), { ...values, id: parseInt(id) });
                } else {
                    await createTemplate(values);
                }
                navigate('/templates');
            } catch (err) {
                setError('Failed to save template. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                setLoading(true);
                try {
                    const response = await getTemplate(parseInt(id));
                    formik.setValues(response.data);
                } catch (err) {
                    setError('Failed to fetch template. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            fetchTemplate();
        }
    }, [id]);

    if (loading) return <CircularProgress />;

    return (
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                {id ? 'Edit Template' : 'Create New Template'}
            </Typography>
            {error && <ErrorMessage message={error} />}
            <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Template Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
                fullWidth
                margin="normal"
                name="content"
                label="Template Content"
                multiline
                rows={4}
                value={formik.values.content}
                onChange={formik.handleChange}
                error={formik.touched.content && Boolean(formik.errors.content)}
                helperText={formik.touched.content && formik.errors.content}
            />
            <TextField
                fullWidth
                margin="normal"
                name="font_family"
                label="Font Family"
                value={formik.values.font_family}
                onChange={formik.handleChange}
                error={formik.touched.font_family && Boolean(formik.errors.font_family)}
                helperText={formik.touched.font_family && formik.errors.font_family}
            />
            <TextField
                fullWidth
                margin="normal"
                name="font_size"
                label="Font Size"
                type="number"
                value={formik.values.font_size}
                onChange={formik.handleChange}
                error={formik.touched.font_size && Boolean(formik.errors.font_size)}
                helperText={formik.touched.font_size && formik.errors.font_size}
            />
            <TextField
                fullWidth
                margin="normal"
                name="primary_color"
                label="Primary Color"
                value={formik.values.primary_color}
                onChange={formik.handleChange}
                error={formik.touched.primary_color && Boolean(formik.errors.primary_color)}
                helperText={formik.touched.primary_color && formik.errors.primary_color}
            />
            <TextField
                fullWidth
                margin="normal"
                name="secondary_color"
                label="Secondary Color"
                value={formik.values.secondary_color}
                onChange={formik.handleChange}
                error={formik.touched.secondary_color && Boolean(formik.errors.secondary_color)}
                helperText={formik.touched.secondary_color && formik.errors.secondary_color}
            />
            <TextField
                fullWidth
                margin="normal"
                name="logo_url"
                label="Logo URL"
                value={formik.values.logo_url}
                onChange={formik.handleChange}
                error={formik.touched.logo_url && Boolean(formik.errors.logo_url)}
                helperText={formik.touched.logo_url && formik.errors.logo_url}
            />
            <TextField
                fullWidth
                margin="normal"
                name="custom_css"
                label="Custom CSS"
                multiline
                rows={4}
                value={formik.values.custom_css}
                onChange={formik.handleChange}
                error={formik.touched.custom_css && Boolean(formik.errors.custom_css)}
                helperText={formik.touched.custom_css && formik.errors.custom_css}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Save Template
            </Button>
        </Box>
    );
};

export default TemplateForm;