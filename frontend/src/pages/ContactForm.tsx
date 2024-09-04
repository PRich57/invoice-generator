import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ContactCreate, ContactUpdate } from '../types';
import { createContact, getContact, updateContact } from '../services/api';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    company: Yup.string(),
    email: Yup.string().email('Invalid email'),
    phone: Yup.string(),
    street_address: Yup.string(),
    address_line2: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    postal_code: Yup.string(),
    country: Yup.string(),
    type: Yup.string().oneOf(['bill_to', 'send_to']).required('Contact type is required'),
    notes: Yup.string(),
});

const ContactForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

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
        type: 'bill_to',
        notes: '',
    };

    const formik = useFormik<ContactCreate>({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError(null);
            try {
                if (id) {
                    await updateContact(parseInt(id), { ...values, id: parseInt(id) });
                } else {
                    await createContact(values);
                }
                navigate('/contacts');
            } catch (err) {
                setError('Failed to save contact. Please try again.');
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if (id) {
            const fetchContact = async () => {
                setLoading(true);
                try {
                    const response = await getContact(parseInt(id));
                    formik.setValues(response.data);
                } catch (err) {
                    setError('Failed to fetch contact. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            fetchContact();
        }
    }, [id]);

    if (loading) return <LoadingSpinner />;

    return (
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                {id ? 'Edit Contact' : 'Create New Contact'}
            </Typography>
            {error && <ErrorMessage message={error} />}

            <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
                fullWidth
                margin="normal"
                name="company"
                label="Company"
                value={formik.values.company}
                onChange={formik.handleChange}
                error={formik.touched.company && Boolean(formik.errors.company)}
                helperText={formik.touched.company && formik.errors.company}
            />

            <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
                fullWidth
                margin="normal"
                name="phone"
                label="Phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
            />

            <TextField
                fullWidth
                margin="normal"
                name="street_address"
                label="Street Address"
                value={formik.values.street_address}
                onChange={formik.handleChange}
                error={formik.touched.street_address && Boolean(formik.errors.street_address)}
                helperText={formik.touched.street_address && formik.errors.street_address}
            />

            <TextField
                fullWidth
                margin="normal"
                name="address_line2"
                label="Address Line 2"
                value={formik.values.address_line2}
                onChange={formik.handleChange}
                error={formik.touched.address_line2 && Boolean(formik.errors.address_line2)}
                helperText={formik.touched.address_line2 && formik.errors.address_line2}
            />

            <TextField
                fullWidth
                margin="normal"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
            />

            <TextField
                fullWidth
                margin="normal"
                name="state"
                label="State"
                value={formik.values.state}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
            />

            <TextField
                fullWidth
                margin="normal"
                name="postal_code"
                label="Postal Code"
                value={formik.values.postal_code}
                onChange={formik.handleChange}
                error={formik.touched.postal_code && Boolean(formik.errors.postal_code)}
                helperText={formik.touched.postal_code && formik.errors.postal_code}
            />

            <TextField
                fullWidth
                margin="normal"
                name="country"
                label="Country"
                value={formik.values.country}
                onChange={formik.handleChange}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel id="contact-type-label">Contact Type</InputLabel>
                <Select
                    labelId="contact-type-label"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                >
                    <MenuItem value="bill_to">Bill To</MenuItem>
                    <MenuItem value="send_to">Send To</MenuItem>
                </Select>
            </FormControl>

            <TextField
                fullWidth
                margin="normal"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
            />

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Save Contact
            </Button>
        </Box>
    );
};

export default ContactForm;