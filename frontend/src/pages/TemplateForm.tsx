import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, CircularProgress, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TemplateCreate, Template } from '../types';
import { createTemplate, getTemplate, updateTemplate } from '../services/api';
import ErrorMessage from '../components/common/ErrorMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Template name is required'),
    colors: Yup.object({
        primary: Yup.string().required('Primary color is required'),
        secondary: Yup.string().required('Secondary color is required'),
        accent: Yup.string().required('Accent color is required'),
    }),
    fonts: Yup.object({
        main: Yup.string().required('Main font is required'),
        accent: Yup.string().required('Accent font is required'),
    }),
    font_sizes: Yup.object({
        title: Yup.number().required('Title font size is required'),
        invoice_number: Yup.number().required('Invoice number font size is required'),
        section_header: Yup.number().required('Section header font size is required'),
        table_header: Yup.number().required('Table header font size is required'),
        normal_text: Yup.number().required('Normal text font size is required'),
    }),
    layout: Yup.object({
        page_size: Yup.string().required('Page size is required'),
        margin_top: Yup.number().required('Top margin is required'),
        margin_right: Yup.number().required('Right margin is required'),
        margin_bottom: Yup.number().required('Bottom margin is required'),
        margin_left: Yup.number().required('Left margin is required'),
    }),
    custom_css: Yup.string(),
});

const DEFAULT_TEMPLATES = {
    default: {
        colors: {
            primary: "#333333",
            secondary: "#555555",
            accent: "#444444"
        },
        fonts: {
            main: "Arial",
            accent: "Arial-Bold"
        },
        font_sizes: {
            title: 20,
            invoice_number: 14,
            section_header: 8,
            table_header: 10,
            normal_text: 9
        },
        layout: {
            page_size: "A4",
            margin_top: 0.3,
            margin_right: 0.5,
            margin_bottom: 0.5,
            margin_left: 0.5
        }
    },
    modern: {
        colors: {
            primary: "#2C3E50",
            secondary: "#7F8C8D",
            accent: "#3498DB"
        },
        fonts: {
            main: "Helvetica",
            accent: "Helvetica-Bold"
        },
        font_sizes: {
            title: 24,
            invoice_number: 16,
            section_header: 12,
            table_header: 14,
            normal_text: 10
        },
        layout: {
            page_size: "A4",
            margin_top: 0.4,
            margin_right: 0.6,
            margin_bottom: 0.4,
            margin_left: 0.6
        }
    },
    classic: {
        colors: {
            primary: "#4A4A4A",
            secondary: "#A9A9A9",
            accent: "#8B0000"
        },
        fonts: {
            main: "Times New Roman",
            accent: "Times-Bold"
        },
        font_sizes: {
            title: 22,
            invoice_number: 14,
            section_header: 11,
            table_header: 12,
            normal_text: 9
        },
        layout: {
            page_size: "LETTER",
            margin_top: 0.5,
            margin_right: 0.5,
            margin_bottom: 0.5,
            margin_left: 0.5,
        }
    },    
};

const TemplateForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const initialValues: TemplateCreate = {
        name: '',
        colors: {
            primary: '#000000',
            secondary: '#555555',
            accent: '#444444',
        },
        fonts: {
            main: 'Helvetica',
            accent: 'Helvetica-Bold',
        },
        font_sizes: {
            title: 20,
            invoice_number: 14,
            section_header: 8,
            table_header: 10,
            normal_text: 9,
        },
        layout: {
            page_size: 'A4',
            margin_top: 0.3,
            margin_right: 0.5,
            margin_bottom: 0.5,
            margin_left: 0.5,
        },
        custom_css: '',
    };

    const formik = useFormik<TemplateCreate>({
        initialValues,
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

    const handleBaseTemplateChange = (event: SelectChangeEvent<unknown>) => {
        const templateName = event.target.value as keyof typeof DEFAULT_TEMPLATES;
        if (DEFAULT_TEMPLATES[templateName]) {
            formik.setValues({
                ...formik.values,
                ...DEFAULT_TEMPLATES[templateName],
                name: `Custom ${templateName}`,
            });
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                {id ? 'Edit Template' : 'Create New Template'}
            </Typography>
            {error && <ErrorMessage message={error} />}

            <FormControl fullWidth margin="normal">
                <InputLabel id="base-template-label">Base Template</InputLabel>
                <Select
                    labelId="base-template-label"
                    id="base-template"
                    onChange={handleBaseTemplateChange}
                >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="modern">Modern</MenuItem>
                    <MenuItem value="classic">Classic</MenuItem>
                </Select>
            </FormControl>

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

            {/* Colors */}
            <TextField
                fullWidth
                margin="normal"
                name="colors.primary"
                label="Primary Color"
                value={formik.values.colors.primary}
                onChange={formik.handleChange}
                error={formik.touched.colors?.primary && Boolean(formik.errors.colors?.primary)}
                helperText={formik.touched.colors?.primary && formik.errors.colors?.primary}
            />
            <TextField
                fullWidth
                margin="normal"
                name="colors.secondary"
                label="Secondary Color"
                value={formik.values.colors.secondary}
                onChange={formik.handleChange}
                error={formik.touched.colors?.secondary && Boolean(formik.errors.colors?.secondary)}
                helperText={formik.touched.colors?.secondary && formik.errors.colors?.secondary}
            />
            <TextField
                fullWidth
                margin="normal"
                name="colors.accent"
                label="Accent Color"
                value={formik.values.colors.accent}
                onChange={formik.handleChange}
                error={formik.touched.colors?.accent && Boolean(formik.errors.colors?.accent)}
                helperText={formik.touched.colors?.accent && formik.errors.colors?.accent}
            />

            {/* Fonts */}
            <TextField
                fullWidth
                margin="normal"
                name="fonts.main"
                label="Main Font"
                value={formik.values.fonts.main}
                onChange={formik.handleChange}
                error={formik.touched.fonts?.main && Boolean(formik.errors.fonts?.main)}
                helperText={formik.touched.fonts?.main && formik.errors.fonts?.main}
            />
            <TextField
                fullWidth
                margin="normal"
                name="fonts.accent"
                label="Accent Font"
                value={formik.values.fonts.accent}
                onChange={formik.handleChange}
                error={formik.touched.fonts?.accent && Boolean(formik.errors.fonts?.accent)}
                helperText={formik.touched.fonts?.accent && formik.errors.fonts?.accent}
            />

            {/* Font Sizes */}
            {Object.entries(formik.values.font_sizes).map(([key, value]) => (
                <TextField
                    key={key}
                    fullWidth
                    margin="normal"
                    name={`font_sizes.${key}`}
                    label={`${key.replace('_', ' ')} Font Size`}
                    type="number"
                    value={value}
                    onChange={formik.handleChange}
                    error={formik.touched.font_sizes?.[key as keyof typeof formik.values.font_sizes] && Boolean(formik.errors.font_sizes?.[key as keyof typeof formik.values.font_sizes])}
                    helperText={formik.touched.font_sizes?.[key as keyof typeof formik.values.font_sizes] && formik.errors.font_sizes?.[key as keyof typeof formik.values.font_sizes]}
                />
            ))}

            {/* Layout */}
            <TextField
                fullWidth
                margin="normal"
                name="layout.page_size"
                label="Page Size"
                value={formik.values.layout.page_size}
                onChange={formik.handleChange}
                error={formik.touched.layout?.page_size && Boolean(formik.errors.layout?.page_size)}
                helperText={formik.touched.layout?.page_size && formik.errors.layout?.page_size}
            />
            {Object.entries(formik.values.layout).filter(([key]) => key !== 'page_size').map(([key, value]) => (
                <TextField
                    key={key}
                    fullWidth
                    margin="normal"
                    name={`layout.${key}`}
                    label={`${key.replace('_', ' ')} Margin`}
                    type="number"
                    value={value}
                    onChange={formik.handleChange}
                    error={formik.touched.layout?.[key as keyof typeof formik.values.layout] && Boolean(formik.errors.layout?.[key as keyof typeof formik.values.layout])}
                    helperText={formik.touched.layout?.[key as keyof typeof formik.values.layout] && formik.errors.layout?.[key as keyof typeof formik.values.layout]}
                />
            ))}

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