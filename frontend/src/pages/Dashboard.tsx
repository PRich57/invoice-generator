import { AccountCircle, AddOutlined, Description, Login, PaletteOutlined, Person, ReceiptLongOutlined } from '@mui/icons-material';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import { useInvoices } from '../hooks/useInvoices';
import { useTemplates } from '../hooks/useTemplates';

const Dashboard: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { contactCount } = useContacts();
    const { invoiceCount } = useInvoices();
    const { templateCount } = useTemplates();

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Dashboard
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
                <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 340, flex: 1 }}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Invoices
                    </Typography>
                    <Typography component="p" variant="h4" sx={{ mb: 2 }}>
                        {isAuthenticated ? invoiceCount : 'Create Now'}
                    </Typography>
                    <Typography color="text.secondary" sx={{ flex: 1 }}>
                        {isAuthenticated ? 'Active invoices' : 'Try our free invoice generator'}
                    </Typography>
                    <Button
                        variant='contained'
                        component={Link}
                        to="/invoices/new"
                        endIcon={<ReceiptLongOutlined />}
                    >
                        Create Invoice
                    </Button>
                    {isAuthenticated ?
                        <Button
                            variant='outlined'
                            component={Link}
                            to="/invoices"
                            endIcon={<Description />}
                            sx={{ mt: 1 }}
                        >
                            Manage Invoices
                        </Button> : ''}
                </Paper>
                {isAuthenticated ? (
                    <>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 340, flex: 1 }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Contacts
                            </Typography>
                            <Typography component="p" variant="h4" sx={{ mb: 2 }}>
                                {contactCount ? contactCount : <LoadingSpinner />}
                            </Typography>
                            <Typography color="text.secondary" sx={{ flex: 1 }}>
                                Total contacts
                            </Typography>
                            <Button
                                variant='contained'
                                component={Link}
                                to="/contacts/new"
                                endIcon={<AddOutlined />}
                                sx={{ mb: 1 }}
                            >
                                New Contact
                            </Button>
                            <Button
                                variant='outlined'
                                component={Link}
                                to="/contacts"
                                endIcon={<Person />}
                            >
                                Manage Contacts
                            </Button>
                        </Paper>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 340, flex: 1 }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Templates
                            </Typography>
                            <Typography component="p" variant="h4" sx={{ mb: 2 }}>
                                {templateCount ? templateCount : <LoadingSpinner />}
                            </Typography>
                            <Typography color="text.secondary" sx={{ flex: 1 }}>
                                Available templates
                            </Typography>
                            <Button
                                variant='contained'
                                component={Link}
                                to="/contacts/new"
                                endIcon={<PaletteOutlined />}
                                sx={{ mb: 1 }}
                            >
                                Custom Template
                            </Button>
                            <Button
                                variant='outlined'
                                component={Link}
                                to="/templates"
                                endIcon={<Description />}
                            >
                                Manage Templates
                            </Button>
                        </Paper>
                    </>
                ) : (
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 340,
                            flex: 1,
                            border: 1,
                            borderColor: 'primary.main'
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Unlock Full Potential
                        </Typography>
                        <Typography sx={{ mb: 2, flex: 1 }}>
                            Manage your business effortlessly:
                            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                                <li>Save and organize invoices securely</li>
                                <li>Manage contacts and client information</li>
                                <li>Create and customize professional templates</li>
                                <li>Include your company logo for a branded touch</li>
                                <li>Send invoices and track payments seamlessly</li>
                                <li>...and much more!</li>
                            </ul>
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant='contained'
                                component={Link}
                                to="/register"
                                endIcon={<AccountCircle />}
                                fullWidth
                            >
                                Sign Up
                            </Button>
                            <Button
                                variant='outlined'
                                component={Link}
                                to="/login"
                                color="primary"
                                endIcon={<Login />}
                                fullWidth
                            >
                                Login
                            </Button>
                        </Stack>
                    </Paper>
                )}
            </Stack>
            {!isAuthenticated && (
                <Box mt={3}>
                    <Typography variant="body1" align="center" color="text.secondary">
                        Create a free account to access all features and start managing your invoices efficiently.
                    </Typography>
                </Box>
            )}
        </Container>
    );
}

export default Dashboard;