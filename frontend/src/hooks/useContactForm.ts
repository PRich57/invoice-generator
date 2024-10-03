import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { ContactCreate, Contact } from '../types';
import { contactValidationSchema } from '../validationSchemas/contactValidationSchema';
import { useErrorHandler } from './useErrorHandler';
import { useFetch } from './useFetch';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { useSnackbar } from 'notistack';

export const useContactForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues: ContactCreate = {
        name: '',
        company: '',
        email: '',
        phone: '',
        street_address: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        notes: ''
    };

    const { data: contactData, isLoading, refetch } = useFetch<Contact | null>(
        id ? `${API_ENDPOINTS.CONTACTS}/${id}` : null
    );

    const { fetchData: submitForm } = useFetch<Contact>(
        API_ENDPOINTS.CONTACTS,
        { method: id ? 'PUT' : 'POST' }
    );

    useEffect(() => {
        if (id) {
            refetch();
        }
    }, []);

    const formik = useFormik<ContactCreate>({
        initialValues: contactData || initialValues,
        validationSchema: contactValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                await submitForm({
                    data: values,
                    url: id ? `${API_ENDPOINTS.CONTACTS}/${id}` : API_ENDPOINTS.CONTACTS
                });
                enqueueSnackbar(id ? 'Contact updated successfully' : 'Contact created successfully', 
                    { variant: 'success' }
                );
                navigate('/contacts');
            } catch (err) {
                enqueueSnackbar("Failed to submit contact form. Please try again.",
                    { variant: 'error' }
                )
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return { formik, isLoading, isSubmitting };
};