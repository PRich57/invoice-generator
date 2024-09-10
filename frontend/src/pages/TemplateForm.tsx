import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, CircularProgress, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TemplateCreate } from '../types';
import { createTemplate, getTemplate, updateTemplate } from '../services/api';
import ErrorMessage from '../components/common/ErrorMessage';
import { SketchPicker } from 'react-color';

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
            text: '#000000',
            background: '#FFFFFF',
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

    const [colorPickerOpen, setColorPickerOpen] = React.useState({
        primary: false,
        secondary: false,
        accent: false,
        text: false,
        background: false,
    });

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

    const handleColorChange = (color: string, field: keyof typeof formik.values.colors) => {
        formik.setFieldValue(`colors.${field}`, color);
    };

    const colorPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setColorPickerOpen({
                    primary: false,
                    secondary: false,
                    accent: false,
                    text: false,
                    background: false,
                });
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

            {/* Colors */}
            {Object.entries(formik.values.colors).map(([key, value]) => (
                <Box key={key} sx={{ mb: 2 }}>
                    <Typography>{key.charAt(0).toUpperCase() + key.slice(1)} Color</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            name={`colors.${key}`}
                            value={value}
                            onChange={formik.handleChange}
                            error={formik.touched.colors?.[key as keyof typeof formik.values.colors] && Boolean(formik.errors.colors?.[key as keyof typeof formik.values.colors])}
                            helperText={formik.touched.colors?.[key as keyof typeof formik.values.colors] && formik.errors.colors?.[key as keyof typeof formik.values.colors]}
                        />
                        <Button onClick={() => setColorPickerOpen(prev => ({ ...prev, [key]: !prev[key as keyof typeof colorPickerOpen] }))}>
                            Pick Color
                        </Button>
                    </Box>
                    {colorPickerOpen[key as keyof typeof colorPickerOpen] && (
                        <Box sx={{ position: 'absolute', zIndex: 2 }} ref={colorPickerRef}>
                            <SketchPicker
                                color={value}
                                onChange={(color) => handleColorChange(color.hex, key as keyof typeof formik.values.colors)}
                            />
                        </Box>
                    )}
                </Box>
            ))}

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