import React, { useState } from 'react';
import {
    Box,
    Button,
    Stack,
    Typography,
    useTheme,
    useMediaQuery,
    Chip,
    Divider,
    CircularProgress,
    Fade,
    Badge,
    Tooltip,
    Collapse,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { TransitionGroup } from 'react-transition-group';
import { 
    GroupWork as GroupIcon, 
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import GroupByComponent, { groupOptions } from './GroupByComponent';

interface MobileGroupControlsProps {
    groupBy: string[]; 
    onUpdateGrouping: (value: string[]) => void;
    isLoading?: boolean;
}

const MobileGroupControls: React.FC<MobileGroupControlsProps> = ({
    groupBy,
    onUpdateGrouping,
    isLoading = false
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClearGroups = () => {
        onUpdateGrouping([]);
    };

    // Get the label for the current group
    const currentGroup = groupBy.length > 0 ? groupBy[0] : '';
    const currentGroupLabel = groupOptions.find(opt => opt.value === currentGroup)?.label || '';

    // Desktop view
    if (!isMobile) {
        return (
            <Box width="30%">
                <Accordion 
                    expanded={expanded} 
                    onChange={() => setExpanded(!expanded)}
                    sx={{
                        bgcolor: 'background.paper'
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            {groupBy ? `Grouped by: ${currentGroupLabel}` : 'Group By'}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            <GroupByComponent
                                groupBy={groupBy}
                                onUpdateGrouping={onUpdateGrouping}
                            />
                            {groupBy && (
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={handleClearGroups}
                                    color="primary"
                                >
                                    Clear Grouping
                                </Button>
                            )}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </Box>
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
                    gap={1}
                >
                    <Tooltip title={currentGroupLabel ? `Grouped by: ${currentGroupLabel}` : "Group Options"}>
                        <Badge 
                            badgeContent={groupBy.length} 
                            color="primary"
                            sx={{
                                '& .MuiBadge-badge': {
                                    right: 4,
                                    top: 4,
                                }
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<GroupIcon />}
                                onClick={() => setDrawerOpen(true)}
                                sx={{ minWidth: 'auto' }}
                            >
                                {currentGroupLabel || 'Group By'}
                            </Button>
                        </Badge>
                    </Tooltip>
                    {groupBy.length > 0 && (
                        <Fade in>
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
                                Clear Group
                            </Button>
                        </Fade>
                    )}
                </Box>
            </Stack>

            <SwipeableDrawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onOpen={() => setDrawerOpen(true)}
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
                        {groupBy && (
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
                                Clear
                            </Button>
                        )}
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            px: 2,
                            py: 2,
                        }}
                    >
                        <GroupByComponent
                            groupBy={groupBy}
                            onUpdateGrouping={(value) => {
                                onUpdateGrouping(value);
                                setDrawerOpen(false);
                            }}
                        />
                        {!isLoading && (
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
                        )}
                    </Box>

                    {/* Current grouping display */}
                    {groupBy && (
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
            </SwipeableDrawer>
        </Box>
    );
};

export default MobileGroupControls;