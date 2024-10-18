import React from 'react';
import { Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { useParams } from 'react-router-dom';
import ContactForm from '../components/contacts/ContactForm';

const ContactFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom color="primary" sx={{ mb: 3 }}>
                {id ? 'Edit Contact' : 'Create New Contact'}
            </Typography>
            <ContactForm id={id} />
        </Box>
    );
};

export default ContactFormPage;