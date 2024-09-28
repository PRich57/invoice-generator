// import { AccountCircle, AddOutlined, Description, Login, PaletteOutlined, Person, ReceiptLongOutlined } from '@mui/icons-material';
// import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
// import React from 'react';
// import { Link } from 'react-router-dom';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import { useAuth } from '../hooks/useAuth';
// import { useContacts } from '../hooks/useContacts';
// import { useInvoices } from '../hooks/useInvoices';
// import { useTemplates } from '../hooks/useTemplates';

// const Dashboard: React.FC = () => {
//     const { isAuthenticated } = useAuth();
//     const { contactCount } = useContacts();
//     // const { invoiceCount } = useInvoices();
//     const { templateCount } = useTemplates();

//     return (
//         <Container maxWidth="lg">
//             <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
//                 Dashboard
//             </Typography>
//             <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
//                 <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 340, flex: 1 }}>
//                     <Typography component="h2" variant="h6" color="primary" gutterBottom>
//                         Invoices
//                     </Typography>
//                     <Typography component="p" variant="h4" sx={{ mb: 2 }}>
//                         {isAuthenticated ? 0 : 'Create Now'}
//                     </Typography>
//                     <Typography color="text.secondary" sx={{ flex: 1 }}>
//                         {isAuthenticated ? 'Active invoices' : 'Try our free invoice generator'}
//                     </Typography>
//                     <Button
//                         variant='contained'
//                         component={Link}
//                         to="/invoices/new"
//                         endIcon={<ReceiptLongOutlined />}
//                     >
//                         Create Invoice
//                     </Button>
//                     {isAuthenticated ?
//                         <Button
//                             variant='outlined'
//                             component={Link}
//                             to="/invoices"
//                             endIcon={<Description />}
//                             sx={{ mt: 1 }}
//                         >
//                             Manage Invoices
//                         </Button> : ''}
//                 </Paper>
//                 {isAuthenticated ? (
//                     <>
//                         <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 340, flex: 1 }}>
//                             <Typography component="h2" variant="h6" color="primary" gutterBottom>
//                                 Contacts
//                             </Typography>
//                             <Typography component="p" variant="h4" sx={{ mb: 2 }}>
//                                 {contactCount ? contactCount : 0}
//                             </Typography>
//                             <Typography color="text.secondary" sx={{ flex: 1 }}>
//                                 Total contacts
//                             </Typography>
//                             <Button
//                                 variant='contained'
//                                 component={Link}
//                                 to="/contacts/new"
//                                 endIcon={<AddOutlined />}
//                                 sx={{ mb: 1 }}
//                             >
//                                 New Contact
//                             </Button>
//                             <Button
//                                 variant='outlined'
//                                 component={Link}
//                                 to="/contacts"
//                                 endIcon={<Person />}
//                             >
//                                 Manage Contacts
//                             </Button>
//                         </Paper>
//                         <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 340, flex: 1 }}>
//                             <Typography component="h2" variant="h6" color="primary" gutterBottom>
//                                 Templates
//                             </Typography>
//                             <Typography component="div" variant="h4" sx={{ mb: 2 }}>
//                                 {templateCount ? templateCount : <LoadingSpinner />}
//                             </Typography>
//                             <Typography color="text.secondary" sx={{ flex: 1 }}>
//                                 Available templates
//                             </Typography>
//                             <Button
//                                 variant='contained'
//                                 component={Link}
//                                 to="/templates/new"
//                                 endIcon={<PaletteOutlined />}
//                                 sx={{ mb: 1 }}
//                             >
//                                 Custom Template
//                             </Button>
//                             <Button
//                                 variant='outlined'
//                                 component={Link}
//                                 to="/templates"
//                                 endIcon={<Description />}
//                             >
//                                 Manage Templates
//                             </Button>
//                         </Paper>
//                     </>
//                 ) : (
//                     <Paper
//                         sx={{
//                             p: 3,
//                             display: 'flex',
//                             flexDirection: 'column',
//                             height: 340,
//                             flex: 1,
//                             border: 1,
//                             borderColor: 'primary.main'
//                         }}
//                     >
//                         <Typography component="h2" variant="h6" color="primary" gutterBottom>
//                             Unlock Full Potential
//                         </Typography>
//                         <Typography component="div" sx={{ mb: 2, flex: 1 }}>
//                             Manage your business effortlessly:
//                             <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
//                                 <li>Save and organize invoices securely</li>
//                                 <li>Manage contacts and client information</li>
//                                 <li>Create and customize professional templates</li>
//                                 <li>Include your company logo for a branded touch</li>
//                                 <li>Send invoices and track payments seamlessly</li>
//                                 <li>...and much more!</li>
//                             </ul>
//                         </Typography>

//                         <Stack direction="row" spacing={2}>
//                             <Button
//                                 variant='contained'
//                                 component={Link}
//                                 to="/register"
//                                 endIcon={<AccountCircle />}
//                                 fullWidth
//                             >
//                                 Sign Up
//                             </Button>
//                             <Button
//                                 variant='outlined'
//                                 component={Link}
//                                 to="/login"
//                                 color="primary"
//                                 endIcon={<Login />}
//                                 fullWidth
//                             >
//                                 Login
//                             </Button>
//                         </Stack>
//                     </Paper>
//                 )}
//             </Stack>
//             {!isAuthenticated && (
//                 <Box mt={3}>
//                     <Typography variant="body1" align="center" color="text.secondary">
//                         Create a free account to access all features and start managing your invoices efficiently.
//                     </Typography>
//                 </Box>
//             )}
//         </Container>
//     );
// }

// export default Dashboard;

import React, { useState } from 'react';
import { Typography, Box, Paper, Button, Stack, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Link } from 'react-router-dom';
import {
    AccountCircle,
    AddOutlined,
    Description,
    Login
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import { useInvoices } from '../hooks/useInvoices';
import { useTemplates } from '../hooks/useTemplates';
import { formatCurrency } from '../utils/currencyFormatter';

const Dashboard: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { contactCount } = useContacts();
    const {
        invoiceTotals,
        invoiceCounts,
        recentInvoices,
        getPaidInvoices
    } = useInvoices();
    const { templateCount } = useTemplates();

    const [paidInvoicesPeriod, setPaidInvoicesPeriod] = useState<'30' | '60' | '90' | 'all'>('30');

    const handlePeriodChange = (event: SelectChangeEvent<string>) => {
        setPaidInvoicesPeriod(event.target.value as '30' | '60' | '90' | 'all');
    };

    getPaidInvoices(paidInvoicesPeriod)

    const StatCard: React.FC<{ title: string; count: number; amount: number | string; color: string }> = ({ title, count, amount, color }) => (
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ pb: 2 }}>{title}</Typography>
                <Typography variant="h5" color={color}>{count} invoices</Typography>
                <Typography variant="h5" color={color}>{formatCurrency(amount)}</Typography>
            </Paper>
    );

    const ActionCard: React.FC<{ title: string, count: number | string, createLink: string, manageLink: string }> = ({ title, count, createLink, manageLink }) => (
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>{title}</Typography>
            <Typography component="p" variant="h4" sx={{ mb: 2 }}>{count}</Typography>
            <Typography color="text.secondary" sx={{ flex: 1, mb: 1 }}>
                {isAuthenticated ? 'Active items' : 'Try our free invoice generator'}
            </Typography>
            <Button
                variant='contained'
                component={Link}
                to={createLink}
                endIcon={<AddOutlined />}
                sx={{ mb: 1 }}
            >
                {isAuthenticated ? 'Create New' : 'Try Now'}
            </Button>
            {isAuthenticated && (
                <Button
                    variant='outlined'
                    component={Link}
                    to={manageLink}
                    endIcon={<Description />}
                >
                    Manage
                </Button>
            )}
        </Paper>
    );

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 10, sm: 3 } }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Dashboard</Typography>

            {isAuthenticated ? (
                <Box>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
                        <Box flex={1}>
                            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6">Paid</Typography>
                                    <Select
                                        value={paidInvoicesPeriod}
                                        onChange={handlePeriodChange}
                                        size="small"
                                    >
                                        <MenuItem value="30">Past 30 days</MenuItem>
                                        <MenuItem value="60">Past 60 days</MenuItem>
                                        <MenuItem value="90">Past 90 days</MenuItem>
                                        <MenuItem value="all">All Time</MenuItem>
                                    </Select>
                                </Box>
                                <Typography variant="h5" color="success.main">{invoiceCounts.paid} invoices</Typography>
                                <Typography variant="h5" color="success.main">
                                    {formatCurrency(invoiceTotals.paid) || 0}
                                </Typography>
                            </Paper>
                        </Box>
                        <Box flex={1}>
                            <StatCard
                                title="Unpaid"
                                count={invoiceCounts.unpaid}
                                amount={invoiceTotals.unpaid || 0}
                                color="warning.main"
                            />
                        </Box>
                        <Box flex={1}>
                            <StatCard
                                title="Overdue"
                                count={invoiceCounts.overdue}
                                amount={invoiceTotals.overdue || 0}
                                color="error.main"
                            />
                        </Box>
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
                        <Box flex={1}>
                            <ActionCard
                                title="Invoices"
                                count={invoiceCounts.unpaid + invoiceCounts.overdue}
                                createLink="/invoices/new"
                                manageLink="/invoices"
                            />
                        </Box>
                        <Box flex={1}>
                            <ActionCard
                                title="Contacts"
                                count={contactCount}
                                createLink="/contacts/new"
                                manageLink="/contacts"
                            />
                        </Box>
                        <Box flex={1}>
                            <ActionCard
                                title="Templates"
                                count={templateCount}
                                createLink="/templates/new"
                                manageLink="/templates"
                            />
                        </Box>
                    </Stack>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Recent Invoices</Typography>
                        <Stack spacing={2}>
                            {recentInvoices.map((invoice) => (
                                <Paper key={invoice.id} sx={{ p: 2 }}>
                                    <Typography variant="subtitle1">{invoice.invoice_number}</Typography>
                                    <Typography variant="body2" color="text.secondary">Due: invoice.due_date</Typography>
                                    <Typography variant="h6" color="primary.main">${invoice.total}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ maxWidth: '600px', margin: '0 auto' }}>
                    <Stack direction="column" spacing={3} sx={{ mb: 4 }}>
                        <ActionCard
                            title="Invoices"
                            count="Create Now"
                            createLink="/invoices/new"
                            manageLink="/invoices"
                        />
                        <Paper
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                border: 1,
                                borderColor: 'primary.main'
                            }}
                        >
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Unlock Full Potential
                            </Typography>
                            <Typography component="div" sx={{ mb: 2 }}>
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
                    </Stack>

                    <Box mt={3}>
                        <Typography variant="body1" align="center" color="text.secondary">
                            Create a free account to access all features and start managing your invoices efficiently.
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default Dashboard;