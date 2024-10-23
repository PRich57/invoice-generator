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
    Badge,
    Tooltip,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    ArrowBack as ArrowBackIcon,
    SortByAlpha as SortIcon,
    GroupWork as GroupIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { TransitionGroup } from 'react-transition-group';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import InvoiceFiltersComponent from './InvoiceFilters';
import { InvoiceFilters } from '../../types';
import { formatFilterLabel } from '../../utils/filterFormatter';
import { formatDateForAPI, getLastMonthRangeUTC, getThisMonthRangeUTC } from '../../utils/dateFormatter';
import dayjs from 'dayjs';

interface MobileInvoiceFiltersProps {
    filters: InvoiceFilters;
    onFilterChange: (event: any) => void;
    onDateChange: (field: 'date_from' | 'date_to', value: string | null) => void;
    onQuickFilter: (filter: Partial<InvoiceFilters>) => void;
    activeFilters: [string, string | undefined][];
    onRemoveFilter: (key: string) => void;
    onRefresh?: () => void;
    isLoading?: boolean;
    onUpdateGrouping?: (values: string[]) => void;
    groupBy?: string[];
}

const { thisMonthStart, thisMonthEnd } = getThisMonthRangeUTC();
const { lastMonthStart, lastMonthEnd } = getLastMonthRangeUTC();


const quickFilters = [
    { label: 'Paid', filter: { status: 'PAID' } },
    { label: 'Unpaid', filter: { status: 'UNPAID' } },
    { label: 'Overdue', filter: { status: 'OVERDUE' } },
    {
        label: 'This Month', 
        filter: {
            date_from: thisMonthStart,
            date_to: thisMonthEnd
        }
    },
    {
        label: 'Last Month', 
        filter: {
            date_from: lastMonthStart,
            date_to: lastMonthEnd
        }
    },
];

const MobileInvoiceFilters: React.FC<MobileInvoiceFiltersProps> = ({
    filters,
    onFilterChange,
    onDateChange,
    onQuickFilter,
    activeFilters,
    onRemoveFilter,
    onUpdateGrouping,
    groupBy = [],
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Format filter labels using the utility function
    const formattedActiveFilters = activeFilters.map(([key, value]) => ({
        key,
        label: value ? formatFilterLabel(key, value) : '',
    }));

    const handleClearAllFilters = () => {
        const clearFilters: InvoiceFilters = {
            invoice_number: undefined,
            bill_to_name: undefined,
            send_to_name: undefined,
            client_type: undefined,
            invoice_type: undefined,
            status: undefined,
            date_from: undefined,
            date_to: undefined,
            total_min: undefined,
            total_max: undefined
        };
        onQuickFilter(clearFilters);
    };

    return (
        <Box mb={2}>
            <Stack spacing={2}>
                {/* Control Buttons Row */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                >
                    {/* Left side - Filter and Group controls */}
                    <Stack direction="row" spacing={1}>
                        <Badge
                            badgeContent={activeFilters.length}
                            color='primary'
                            sx={{ '& .MuiBadge-badge': { right: 4, top: 4 } }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={() => setDrawerOpen(true)}
                                sx={{ minWidth: 'auto', color: '#EEEEEE', borderColor: '#CCCCCC', borderRadius: '5px', borderWidth: '.1' }}
                            >
                                Filters
                            </Button>
                        </Badge>
                    </Stack>

                    {/* Right side - Clear buttons */}
                    <Stack direction="row" spacing={1}>
                        {activeFilters.length > 0 && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleClearAllFilters}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    px: 2,
                                    minWidth: 'auto',
                                    height: '32px',
                                    typography: 'body2',
                                }}
                                color={'error'}
                                startIcon={<ClearIcon />}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </Stack>
                </Box>

                {/* Quick Filters Row */}
                <Box
                    sx={{
                        overflowX: 'auto',
                        pb: 1,
                        '&::-webkit-scrollbar': { height: '4px' },
                        '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.paper },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: '4px',
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ minWidth: 'min-content' }}
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

                {/* Active Filters Display */}
                {formattedActiveFilters.length > 0 && (
                    <Box
                        sx={{
                            overflowX: 'auto',
                            pb: 1,
                            '&::-webkit-scrollbar': { height: '4px' },
                            '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.paper },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: '4px',
                            },
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ minWidth: 'min-content' }}
                        >
                            {formattedActiveFilters.map(({ key, label }) => (
                                <Chip
                                    key={key}
                                    label={label}
                                    onDelete={() => onRemoveFilter(key)}
                                    size="small"
                                    sx={{
                                        height: 'auto',
                                        '& .MuiChip-label': {
                                            px: 1,
                                            py: 0.75,
                                            display: 'block',
                                            whiteSpace: 'nowrap',
                                        },
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </Stack>

            {/* Filter Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: isMobile ? '90%' : '500px',
                        maxWidth: '100%',
                        p: 0,
                        zIndex: (theme) => theme.zIndex.drawer + 2,
                    }
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Drawer Header */}
                    <Box sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}>
                        <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary' }}>
                            Filters
                        </Typography>
                    </Box>

                    {/* Filter Form */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 2 }}>
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
                                '&:hover': { bgcolor: 'action.hover' },
                                px: 1,
                                minWidth: 'auto',
                                mt: 2,
                                alignSelf: 'flex-start'
                            }}
                        >
                            Back to list
                        </Button>
                    </Box>

                    {/* Clear Filters Button */}
                    {formattedActiveFilters.length > 0 && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleClearAllFilters}
                            sx={{
                                color: 'text.primary',
                                '&:hover': { bgcolor: 'action.hover' },
                                borderRadius: '0'
                            }}
                        >
                            Clear All Filters
                        </Button>
                    )}

                    {/* Active Filters Footer */}
                    {formattedActiveFilters.length > 0 && (
                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Active Filters
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                {formattedActiveFilters.map(({ key, label }) => (
                                    <Chip
                                        key={key}
                                        label={label}
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
