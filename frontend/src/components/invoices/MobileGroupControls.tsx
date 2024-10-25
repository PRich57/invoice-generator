import React, { useState } from 'react';
import {
    Box,
    Button,
    Stack,
    Typography,
    useTheme,
    useMediaQuery,
    Drawer,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    Chip,
} from '@mui/material';
import {
    GroupWork as GroupIcon,
    ArrowBack as ArrowBackIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import MobileResponsiveTooltip from '../common/MobileResponsiveTooltip';

interface MobileGroupControlsProps {
    groupBy: string[];
    onUpdateGrouping: (value: string[]) => void;
    isLoading?: boolean;
}

export const groupOptions = [
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
    isLoading = false
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isBadgeHovered, setIsBadgeHovered] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClearGroups = () => {
        onUpdateGrouping([]);
    };
    
    const currentGroup = groupBy.length > 0 ? groupBy[0] : '';
    const currentGroupLabel = groupOptions.find(opt => opt.value === currentGroup)?.label;


    return (
        <Box>
            <Box
                sx={{ position: 'relative', display: 'inline-flex' }}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
            >
                <MobileResponsiveTooltip
                    title={currentGroupLabel ? `Grouped by: ${currentGroupLabel}` : "Group Options"}
                    placement="top"
                    arrow
                >
                    <Button
                        variant="outlined"
                        startIcon={<GroupIcon />}
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            minWidth: 'auto',
                            color: '#EEEEEE',
                            borderColor: '#CCCCCC',
                            borderRadius: '5px',
                            borderWidth: '.1px',
                            '&:hover': {
                                borderColor: '#FFFFFF',
                            }
                        }}
                    >
                        {currentGroupLabel || 'Group By'}
                    </Button>
                </MobileResponsiveTooltip>

                {currentGroupLabel && (
                    <MobileResponsiveTooltip
                        title="Clear Group"
                        placement="right"
                        arrow
                    >
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdateGrouping([]);
                            }}
                            onMouseEnter={() => setIsBadgeHovered(true)}
                            onMouseLeave={() => setIsBadgeHovered(false)}
                            sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                width: 20,
                                height: 20,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </MobileResponsiveTooltip>
                )}
            </Box>

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
                ModalProps={{
                    sx: {
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" sx={{ color: 'text.primary' }}>
                            Group By:
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 2 }}>
                        <RadioGroup
                            value={currentGroup}
                            onChange={(e) => {
                                onUpdateGrouping([e.target.value]);
                                setDrawerOpen(false);
                            }}
                        >
                            {groupOptions.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio />}
                                    label={option.label}
                                />
                            ))}
                        </RadioGroup>
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
                                mt: 2,
                                alignSelf: 'flex-start'
                            }}
                        >
                            Back to list
                        </Button>
                    </Box>

                    {groupBy.length > 0 && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleClearGroups}
                            sx={{
                                color: 'text.primary',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                                borderRadius: '0'
                            }}
                        >
                            Clear Group
                        </Button>
                    )}

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
                                Current Grouping
                            </Typography>
                            <Chip
                                label={currentGroupLabel}
                                onDelete={handleClearGroups}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
};

export default MobileGroupControls;