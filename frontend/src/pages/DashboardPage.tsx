import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, Button, Stack, Select, MenuItem, SelectChangeEvent, Collapse } from '@mui/material';
import { Link } from 'react-router-dom';
import {
    AccountCircle,
    AddOutlined,
    Description,
    Login,
    ExpandMore,
    ExpandLess
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import { useInvoices } from '../hooks/useInvoices';
import { useTemplates } from '../hooks/useTemplates';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDateForDisplay } from '../utils/dateFormatter';

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
    const [expandedSections, setExpandedSections] = useState({
        recentlyCreated: true,
        sendReminder: true,
        overdue: true
    });

    const handlePeriodChange = (event: SelectChangeEvent<string>) => {
        setPaidInvoicesPeriod(event.target.value as '30' | '60' | '90' | 'all');
    };

    const toggleSection = (section: 'recentlyCreated' | 'sendReminder' | 'overdue') => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        console.log(invoiceCounts)
        if (isAuthenticated) {
            getPaidInvoices(paidInvoicesPeriod);
        }
    }, [isAuthenticated, paidInvoicesPeriod, getPaidInvoices]);

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

    const InvoiceSection: React.FC<{ title: string; invoices: any[]; expanded: boolean; onToggle: () => void }> = ({ title, invoices, expanded, onToggle }) => (
        <Box>
            <Button onClick={onToggle} sx={{ justifyContent: 'space-between', width: '100%', mb: 2 }}>
                <Typography variant="h6">{title}</Typography>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </Button>
            <Collapse in={expanded}>
                <Stack spacing={2}>
                    {invoices.map((invoice) => (
                        <Paper key={invoice.id} sx={{ p: 2 }}>
                            <Typography variant="subtitle1">{invoice.invoice_number}</Typography>
                            <Typography variant="body2" color="text.secondary">Due: {formatDateForDisplay(invoice.invoice_date)}</Typography>
                            <Typography variant="h6" color="primary.main">{formatCurrency(invoice.total)}</Typography>
                        </Paper>
                    ))}
                </Stack>
            </Collapse>
        </Box>
    );

    return (
        <Box mb={2}>
            <Typography variant="h4" color="primary">Dashboard</Typography>
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 10, sm: 3 } }}>

                {isAuthenticated ? (
                    <>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            <Box flex={1}>
                                <ActionCard
                                    title="Invoices"
                                    count={invoiceCounts.total}
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

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} marginTop={3} marginBottom={3}>
                            <Box flex={1}>
                                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="h6">Paid Invoices</Typography>
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
                                    title="Unpaid Invoices"
                                    count={invoiceCounts.unpaid}
                                    amount={invoiceTotals.unpaid || 0}
                                    color="warning.main"
                                />
                            </Box>
                            <Box flex={1}>
                                <StatCard
                                    title="Overdue Invoices"
                                    count={invoiceCounts.overdue}
                                    amount={invoiceTotals.overdue || 0}
                                    color="error.main"
                                />
                            </Box>
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            <Box flex={1}>
                                <InvoiceSection
                                    title="Recently Created"
                                    invoices={recentInvoices}
                                    expanded={expandedSections.recentlyCreated}
                                    onToggle={() => toggleSection('recentlyCreated')}
                                />
                            </Box>
                            <Box flex={1}>
                                <InvoiceSection
                                    title="Send Reminder"
                                    invoices={recentInvoices}
                                    expanded={expandedSections.sendReminder}
                                    onToggle={() => toggleSection('sendReminder')}
                                />
                            </Box>
                            <Box flex={1}>
                                <InvoiceSection
                                    title="Overdue"
                                    invoices={recentInvoices}
                                    expanded={expandedSections.overdue}
                                    onToggle={() => toggleSection('overdue')}
                                />
                            </Box>
                        </Stack>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Stack spacing={3} sx={{ width: '100%', maxWidth: { xs: '100%', sm: '600px' } }}>
                            <ActionCard
                                title="Invoices"
                                count="Generate Invoice"
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
                                    <ul style={{ marginLeft: '10px', marginTop: '10px', paddingLeft: '15px' }}>
                                        <li>Save and organize invoices securely</li>
                                        <li>Manage contacts and client information</li>
                                        <li>Create and customize professional templates</li>
                                        <li>Include your company logo for a branded touch</li>
                                        <li>Send invoices and track payments seamlessly</li>
                                        <li>...and much more!</li>
                                    </ul>
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                            <Box>
                                <Typography variant="body1" align="center" color="text.secondary">
                                    Create a free account to access all features and start managing your invoices efficiently.
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Dashboard;