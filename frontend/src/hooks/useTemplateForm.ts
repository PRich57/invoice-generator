import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { TemplateCreate, Template } from '../types';
import { templateValidationSchema } from '../validationSchemas/templateValidationSchema';
import { useErrorHandler } from './useErrorHandler';
import { useFetch } from './useFetch';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const useTemplateForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { handleError } = useErrorHandler();
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

    const { data, isLoading, error, refetch } = useFetch<Template | null>(
        id ? `${API_ENDPOINTS.TEMPLATES}/${id}` : null
    );

    useEffect(() => {
        if (id) {
            refetch();
        }
    }, [id, refetch]);

    const { fetchData: submitForm } = useFetch<Template>(
        API_ENDPOINTS.TEMPLATES,
        { method: id ? 'PUT' : 'POST' }
    );

    const formik = useFormik<TemplateCreate>({
        initialValues: data || initialValues,
        validationSchema: templateValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                await submitForm({ 
                    data: values,
                    url: id ? `${API_ENDPOINTS.TEMPLATES}/${id}` : API_ENDPOINTS.TEMPLATES 
                });
                navigate('/templates');
            } catch (err) {
                handleError(err);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return { formik, isLoading, error, isSubmitting, refetch, id };
};