import React, { useState } from 'react';
import {
    Box,
    Button,
    Drawer,
    IconButton,
    Stack,
    Typography,
    useTheme,
    useMediaQuery,
    Chip,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { FilterList as FilterIcon, ArrowBack as ArrowBackIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import InvoiceFiltersComponent from './InvoiceFilters';
import { InvoiceFilters } from '../../types';

interface MobileInvoiceFiltersProps {
    filters: InvoiceFilters;
    onFilterChange: (event: any) => void;
    onDateChange: (field: 'date_from' | 'date_to', value: string | null) => void;
    onQuickFilter: (filter: Partial<InvoiceFilters>) => void;
    activeFilters: [string, string | undefined][];
    onRemoveFilter: (key: string) => void;
}

const quickFilters = [
    { label: 'Paid', filter: { status: 'PAID' } },
    { label: 'Unpaid', filter: { status: 'UNPAID' } },
    { label: 'Overdue', filter: { status: 'OVERDUE' } },
    {
        label: 'This Month', filter: {
            date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            date_to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
        }
    },
    {
        label: 'Last Month', filter: {
            date_from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
            date_to: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
        }
    },
];

const MobileInvoiceFilters: React.FC<MobileInvoiceFiltersProps> = ({
    filters,
    onFilterChange,
    onDateChange,
    onQuickFilter,
    activeFilters,
    onRemoveFilter
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Desktop view
    if (!isMobile) {
        return (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} width='50%'>
                <Box width='70%'>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Filters</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <InvoiceFiltersComponent
                                filters={filters}
                                onFilterChange={onFilterChange}
                                onDateChange={onDateChange}
                            />
                            {activeFilters.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                        {activeFilters.map(([key, value]) => (
                                            <Chip
                                                key={key}
                                                label={`${key}: ${value}`}
                                                onDelete={() => onRemoveFilter(key)}
                                                size="small"
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Stack>
        );
    }

    // Mobile view
    return (
        <Box mb={2}>
            <Stack spacing={2}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    
                >
                    <Box display="flex" gap={2} alignItems="center">
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={() => setDrawerOpen(true)}
                            sx={{ minWidth: 'auto' }}
                        >
                            Filters
                        </Button>
                    </Box>
                    {activeFilters.length > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onQuickFilter({})}
                            sx={{
                                whiteSpace: 'nowrap',
                                px: 2,
                                minWidth: 'auto',
                                height: '32px',
                                typography: 'body2',
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Box>
                {activeFilters.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                        {activeFilters.length} active
                    </Typography>
                )}

                {/* Quick Filters */}
                <Box
                    sx={{
                        overflowX: 'auto',
                        pb: 1,
                        '&::-webkit-scrollbar': {
                            height: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: theme.palette.background.paper,
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: '4px',
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            minWidth: 'min-content',
                        }}
                    >
                        {quickFilters.map((qf, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                size="small"
                                onClick={() => onQuickFilter(qf.filter)}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    px: 2,
                                    minWidth: 'auto',
                                    height: '32px',
                                    typography: 'body2',
                                }}
                            >
                                {qf.label}
                            </Button>
                        ))}
                    </Stack>
                </Box>

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <Box
                        sx={{
                            overflowX: 'auto',
                            pb: 1,
                            '&::-webkit-scrollbar': {
                                height: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: theme.palette.background.paper,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: '4px',
                            },
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                minWidth: 'min-content',
                            }}
                        >
                            {activeFilters.map(([key, value]) => (
                                <Chip
                                    key={key}
                                    label={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                display: 'block',
                                                px: 0.5
                                            }}
                                        >
                                            {`${key}: ${value}`}
                                        </Typography>
                                    }
                                    onDelete={() => onRemoveFilter(key)}
                                    size="small"
                                    sx={{
                                        height: 'auto',
                                        '& .MuiChip-label': {
                                            px: 1,
                                            py: 0.75,
                                        },
                                        '& .MuiChip-deleteIcon': {
                                            fontSize: '18px',
                                        },
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </Stack>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: '400px',
                        maxWidth: '90%',
                        zIndex: (theme) => theme.zIndex.drawer + 2,
                    }
                }}
                ModalProps={{
                    sx: {
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Back button and title */}
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                flexGrow: 1,
                                color: 'text.primary',
                            }}
                        >
                            Filters
                        </Typography>
                        {Object.values(filters).some(value => value !== undefined && value !== '') && (
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => onQuickFilter({})}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    }
                                }}
                            >
                                Clear All
                            </Button>
                        )}
                    </Box>

                    {/* Filter content area */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            px: 2,
                            py: 2,
                            '& .MuiFormControl-root': {
                                mb: 0
                            }
                        }}
                    >
                        <InvoiceFiltersComponent
                            filters={filters}
                            onFilterChange={onFilterChange}
                            onDateChange={onDateChange}
                        />
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setDrawerOpen(false)}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                                px: 1,
                                py: 2,
                                minWidth: 'auto'
                            }}
                        >
                            Back to list
                        </Button>
                    </Box>


                    {/* Active filters at bottom */}
                    {activeFilters.length > 0 && (
                        <Box
                            sx={{
                                p: 2,
                                borderTop: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Active Filters
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                gap={1}
                            >
                                {activeFilters.map(([key, value]) => (
                                    <Chip
                                        key={key}
                                        label={`${key}: ${value}`}
                                        onDelete={() => onRemoveFilter(key)}
                                        size="small"
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
};

export default MobileInvoiceFilters;