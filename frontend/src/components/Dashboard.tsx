import React from 'react';
import { Typography, Container, Box, Paper } from '@mui/material';

const Dashboard: React.FC = () => {
    return (
        <Container component="main" maxWidth="lg">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h4" gutterBottom>
                    Dashboard
                </Typography>
                <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
                    <Typography variant="body1">
                        Welcome to your invoice generator dashboard. Here you can manage your contacts, create invoices, and view your templates.
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}

export default Dashboard;