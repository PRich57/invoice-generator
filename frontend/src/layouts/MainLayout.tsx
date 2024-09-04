import React from 'react';
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, Receipt as InvoicesIcon, Person as ContactsIcon, Description as TemplatesIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 240;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Invoice Generator
                    </Typography>
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItemButton component={Link} to="/dashboard">
                            <ListItemIcon><DashboardIcon /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/invoices">
                            <ListItemIcon><InvoicesIcon /></ListItemIcon>
                            <ListItemText primary="Invoices" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/contacts">
                            <ListItemIcon><ContactsIcon /></ListItemIcon>
                            <ListItemText primary="Contacts" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/templates">
                            <ListItemIcon><TemplatesIcon /></ListItemIcon>
                            <ListItemText primary="Templates" />
                        </ListItemButton>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;