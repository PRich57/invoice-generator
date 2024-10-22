import React, { useState } from 'react';
import {
    Box,
    Button,
    Drawer,
    Stack,
    Typography,
    useTheme,
    useMediaQuery,
    Chip,
    Divider,
    FormGroup,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { GroupWork as GroupIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface MobileGroupControlsProps {
    groupBy: string[];
    onUpdateGrouping: (value: string, checked: boolean) => void;
}

const groupOptions = [
    { value: 'bill_to', label: 'Bill To' },
    { value: 'send_to', label: 'Send To' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'status', label: 'Status' },
    { value: 'client_type', label: 'Client Type' },
    { value: 'invoice_type', label: 'Invoice Type' },
];

const MobileGroupControls: React.FC<MobileGroupControlsProps> = ({
    groupBy,
    onUpdateGrouping,
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!isMobile) {
        return null;
    }

    const handleClearGroups = () => {
        groupBy.forEach(group => onUpdateGrouping(group, false));
    };

    return (
        <Box mb={2}>
            <Stack spacing={2}>
                {/* Group Button */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={1}
                >
                    <Box display="flex" gap={2} alignItems="center">
                        <Button
                            variant="outlined"
                            startIcon={<GroupIcon />}
                            onClick={() => setDrawerOpen(true)}
                            sx={{ minWidth: 'auto' }}
                        >
                            Group By
                        </Button>
                    </Box>
                    {groupBy.length > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleClearGroups}
                            sx={{
                                whiteSpace: 'nowrap',
                                px: 2,
                                minWidth: 'auto',
                                height: '32px',
                                typography: 'body2',
                            }}
                        >
                            Clear Groups
                        </Button>
                    )}
                </Box>

                {/* Active Groups Display */}
                {groupBy.length > 0 && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            {groupBy.length} active
                        </Typography>
                        <Box
                            sx={{
                                overflowX: 'auto',
                                pb: 1,
                                mt: 1,
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
                                {groupBy.map((group) => (
                                    <Chip
                                        key={group}
                                        label={groupOptions.find(opt => opt.value === group)?.label || group}
                                        onDelete={() => onUpdateGrouping(group, false)}
                                        size="small"
                                        sx={{
                                            height: 'auto',
                                            '& .MuiChip-label': {
                                                px: 1,
                                                py: 0.75,
                                            },
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>
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
                    {/* Header */}
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
                            Group By
                        </Typography>
                        {groupBy.length > 0 && (
                            <Button
                                variant="text"
                                size="small"
                                onClick={handleClearGroups}
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

                    {/* Group options */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            px: 2,
                            py: 2,
                        }}
                    >
                        <FormGroup>
                            {groupOptions.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    control={
                                        <Checkbox
                                            checked={groupBy.includes(option.value)}
                                            onChange={(e) => onUpdateGrouping(option.value, e.target.checked)}
                                        />
                                    }
                                    label={option.label}
                                />
                            ))}
                        </FormGroup>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setDrawerOpen(false)}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                                px: 1,
                                minWidth: 'auto',
                                mt: 2
                            }}
                        >
                            Back to list
                        </Button>
                    </Box>

                    {/* Active groups at bottom */}
                    {groupBy.length > 0 && (
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
                                Active Groups
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                gap={1}
                            >
                                {groupBy.map((group) => (
                                    <Chip
                                        key={group}
                                        label={groupOptions.find(opt => opt.value === group)?.label || group}
                                        onDelete={() => onUpdateGrouping(group, false)}
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

export default MobileGroupControls;