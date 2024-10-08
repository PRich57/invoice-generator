import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { TemplateCreate, Template } from '../types';
import { templateValidationSchema } from '../validationSchemas/templateValidationSchema';
import { useErrorHandler } from './useErrorHandler';
import { useFetch } from './useFetch';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { useSnackbar } from 'notistack';

export const useTemplateForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const { data: templateData, isLoading, refetch } = useFetch<Template | null>(
        id ? `${API_ENDPOINTS.TEMPLATES}/${id}` : null
    );

    const { fetchData: submitForm } = useFetch<Template>(
        API_ENDPOINTS.TEMPLATES,
        { method: id ? 'PUT' : 'POST' }
    );

    useEffect(() => {
        if (id) {
            refetch();
        }
    }, []);

    const formik = useFormik<TemplateCreate>({
        initialValues: templateData || initialValues,
        validationSchema: templateValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                await submitForm({
                    data: values,
                    url: id ? `${API_ENDPOINTS.TEMPLATES}/${id}` : API_ENDPOINTS.TEMPLATES
                });
                enqueueSnackbar(id ? 'Template updated successfully' : 'Template created successfully', 
                    { variant: 'success' }
                );
                navigate('/templates');
            } catch (err) {
                handleError(err);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return { formik, isLoading, isSubmitting };
};