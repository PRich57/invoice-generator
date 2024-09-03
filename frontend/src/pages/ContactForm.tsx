import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, MenuItem } from '@mui/material';
import api from '../services/api';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    type: string;
}

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        type: 'bill_to',
    });
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            fetchContact();
        }
    }, [id]);

    const fetchContact = async () => {
        try {
            const response = await api.get(`/contacts/${id}`);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching contact:', error);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (id) {
                await api.put(`/contacts/${id}`, formData);
            } else {
                await api.post('/contacts', formData);
            }
            navigate('/contacts');
        } catch (error) {
            console.error('Error saving contact:', error);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                {id ? 'Edit Contact' : 'Add New Contact'}
            </Typography>
            <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                margin="normal"
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
            >
                <MenuItem value="bill_to">Bill To</MenuItem>
                <MenuItem value="send_to">Send To</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Save Contact
            </Button>
        </Box>
    );
};

export default ContactForm;