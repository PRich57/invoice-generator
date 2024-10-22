import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    useMediaQuery,
    useTheme,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Collapse
} from '@mui/material';
import {
    Menu as MenuIcon,
    Logout as LogoutIcon,
    Login as LoginIcon,
    Dashboard as DashboardIcon,
    Description as InvoicesIcon,
    Person as ContactsIcon,
    ColorLens as TemplatesIcon,
    Close as CloseIcon,
    Add as AddIcon,
    ExpandLess,
    ExpandMore,
    List as ListIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    const handleLogoutOrLogin = async () => {
        if (isAuthenticated) {
            await logout();
        }
        navigate('/login');
        setMobileMenuOpen(false);
    };

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
            alwaysEnabled: true
        },
        {
            text: 'Invoices',
            icon: <InvoicesIcon />,
            path: '/invoices',
            subItems: [
                { text: 'View All', icon: <ListIcon />, path: '/invoices' },
                { text: 'Create New', icon: <AddIcon />, path: '/invoices/new' }
            ]
        },
        {
            text: 'Contacts',
            icon: <ContactsIcon />,
            path: '/contacts',
            subItems: [
                { text: 'View All', icon: <ListIcon />, path: '/contacts' },
                { text: 'Create New', icon: <AddIcon />, path: '/contacts/new' }
            ]
        },
        {
            text: 'Templates',
            icon: <TemplatesIcon />,
            path: '/templates',
            subItems: [
                { text: 'View All', icon: <ListIcon />, path: '/templates' },
                { text: 'Create New', icon: <AddIcon />, path: '/templates/new' }
            ]
        },
    ];

    const handleNavigate = (path: string) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const toggleSubmenu = (text: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    const renderMobileMenu = () => (
        <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            PaperProps={{
                sx: {
                    width: 240,
                    backgroundColor: theme.palette.background.paper,
                }
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                    onClick={() => setMobileMenuOpen(false)}
                    size="small"
                    sx={{
                        bgcolor: 'action.hover',
                        '&:hover': {
                            bgcolor: 'action.selected',
                        }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <React.Fragment key={item.text}>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={item.subItems ? () => toggleSubmenu(item.text) : () => handleNavigate(item.path)}
                                disabled={!isAuthenticated && !item.alwaysEnabled}
                                selected={location.pathname.startsWith(item.path)}
                                sx={{
                                    bgcolor: (theme) =>
                                        expandedMenus[item.text]
                                            ? theme.palette.action.selected
                                            : location.pathname.startsWith(item.path)
                                                ? theme.palette.action.selected
                                                : 'transparent',
                                    '&:hover': {
                                        bgcolor: (theme) => expandedMenus[item.text]
                                            ? theme.palette.action.selected
                                            : theme.palette.action.hover,
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: (theme) => expandedMenus[item.text]
                                            ? theme.palette.action.selected
                                            : theme.palette.action.selected,
                                        '&:hover': {
                                            bgcolor: theme.palette.action.selected,
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: location.pathname.startsWith(item.path) ? 'primary.main' : 'text.primary',
                                        minWidth: '40px', // Slightly reduced icon width
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        '& .MuiTypography-root': {
                                            color: location.pathname.startsWith(item.path) ? 'primary.main' : 'text.primary',
                                        }
                                    }}
                                />
                                {item.subItems && (
                                    expandedMenus[item.text] ? <ExpandLess /> : <ExpandMore />
                                )}
                            </ListItemButton>
                        </ListItem>
                        {item.subItems && (
                            <Collapse in={expandedMenus[item.text]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.subItems.map((subItem) => (
                                        <ListItem key={subItem.text} disablePadding>
                                            <ListItemButton
                                                onClick={() => handleNavigate(subItem.path)}
                                                selected={location.pathname === subItem.path}
                                                sx={{
                                                    pl: 4,
                                                    bgcolor: theme.palette.action.hover,
                                                    '&.Mui-selected': {
                                                        bgcolor: theme.palette.action.selected,
                                                        '&:hover': {
                                                            bgcolor: theme.palette.action.selected,
                                                        },
                                                    },
                                                    '&:hover': {
                                                        bgcolor: theme.palette.action.selected,
                                                    },
                                                }}
                                            >
                                                <ListItemIcon
                                                    sx={{
                                                        color: location.pathname === subItem.path ? 'primary.main' : 'text.secondary',
                                                        minWidth: '40px',
                                                    }}
                                                >
                                                    {subItem.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={subItem.text}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        color: location.pathname === subItem.path ? 'primary.main' : 'text.secondary',
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
                <Divider sx={{ my: 2 }} />
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogoutOrLogin}
                        sx={{
                            color: 'text.primary',
                        }}
                    >
                        <ListItemIcon>
                            {isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
                        </ListItemIcon>
                        <ListItemText primary={isAuthenticated ? "Logout" : "Login"} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );

    return (
        <AppBar position="fixed" sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(5px)',
        }}>
            <Toolbar>
                {isMobile && (
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        color: theme.palette.text.primary,
                        cursor: 'pointer'
                    }}
                    onClick={() => handleNavigate('/dashboard')}
                >
                    Invoice Generator
                </Typography>
                {!isMobile && (
                    <IconButton
                        color="inherit"
                        onClick={handleLogoutOrLogin}
                        aria-label={isAuthenticated ? "logout" : "login"}
                    >
                        {isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
                    </IconButton>
                )}
            </Toolbar>
            {renderMobileMenu()}
        </AppBar>
    );
};

export default Header;