import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { ContactCreate, Contact } from '../types';
import { contactValidationSchema } from '../validationSchemas/contactValidationSchema';
import { useErrorHandler } from './useErrorHandler';
import { useFetch } from './useFetch';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const useContactForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { handleError } = useErrorHandler();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues: ContactCreate = {
        name: '',
        company: '',
        email: '',
        phone: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    };

    const { data, isLoading, error, refetch } = useFetch<Contact | null>(
        id ? `${API_ENDPOINTS.CONTACTS}/${id}` : null
    );

    useEffect(() => {
        if (id) {
            refetch();
        }
    }, [id, refetch]);

    const { fetchData: submitForm } = useFetch<Contact>(
        API_ENDPOINTS.CONTACTS,
        { method: id ? 'PUT' : 'POST' }
    );

    const formik = useFormik<ContactCreate>({
        initialValues: data || initialValues,
        validationSchema: contactValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                await submitForm({
                    data: values,
                    url: id ? `${API_ENDPOINTS.CONTACTS}/${id}` : API_ENDPOINTS.CONTACTS
                });
                navigate('/contacts');
            } catch (err) {
                handleError(err);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return { formik, isLoading, error, isSubmitting, refetch, id };
};