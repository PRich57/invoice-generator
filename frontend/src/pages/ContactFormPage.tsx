import React from 'react';
import { Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import ContactForm from '../components/contacts/ContactForm';

const ContactFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {id ? 'Edit Contact' : 'Create New Contact'}
            </Typography>
            <ContactForm id={id} />
        </Box>
    );
};

export default ContactFormPage;