import React, { useRef } from 'react';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { SketchPicker } from 'react-color';
import { useTemplateForm } from '../hooks/useTemplateForm';
import ErrorMessage from '../components/common/ErrorMessage';
import { useParams } from 'react-router-dom';
import { useColorPicker } from '../hooks/useColorPicker'

const TemplateForm: React.FC = () => {
    const { formik, isLoading, error, isSubmitting } = useTemplateForm();
    const { id } = useParams<{ id: string }>();
    const { colorPickerOpen, toggleColorPicker, colorPickerRef } = useColorPicker();



    const handleColorChange = (color: string, field: keyof typeof formik.values.colors) => {
        formik.setFieldValue(`colors.${field}`, color);
    };

    if (isLoading) return <CircularProgress />;

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

            {/* Color pickers */}
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
                        <Button onClick={() => toggleColorPicker(key)}>
                            Pick Color
                        </Button>
                    </Box>
                    {colorPickerOpen[key] && (
                        <Box sx={{ position: 'absolute', zIndex: 2 }} ref={colorPickerRef}>
                            <SketchPicker
                                color={value}
                                onChange={(color) => formik.setFieldValue(`colors.${key}`, color.hex)}
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

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : (id ? 'Update Template' : 'Create Template')}
            </Button>
        </Box>
    );
};

export default TemplateForm;