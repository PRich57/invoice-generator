import React from 'react';
import { Typography, Container, Box, Paper, Stack } from '@mui/material';
import { Person, Receipt, Description } from '@mui/icons-material';

const Dashboard: React.FC = () => {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, flex: 1 }}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Contacts
                    </Typography>
                    <Typography component="p" variant="h4">
                        23
                    </Typography>
                    <Typography color="text.secondary" sx={{ flex: 1 }}>
                        Total contacts
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Person />
                    </Box>
                </Paper>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, flex: 1 }}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Invoices
                    </Typography>
                    <Typography component="p" variant="h4">
                        15
                    </Typography>
                    <Typography color="text.secondary" sx={{ flex: 1 }}>
                        Active invoices
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Receipt />
                    </Box>
                </Paper>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, flex: 1 }}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Templates
                    </Typography>
                    <Typography component="p" variant="h4">
                        3
                    </Typography>
                    <Typography color="text.secondary" sx={{ flex: 1 }}>
                        Available templates
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Description />
                    </Box>
                </Paper>
            </Stack>
        </Container>
    );
}

export default Dashboard;