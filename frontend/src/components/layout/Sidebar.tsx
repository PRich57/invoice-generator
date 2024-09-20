import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip } from '@mui/material';
import { Dashboard as DashboardIcon, Receipt as InvoicesIcon, Person as ContactsIcon, Description as TemplatesIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', alwaysEnabled: true },
        { text: 'Invoices', icon: <InvoicesIcon />, path: '/invoices' },
        { text: 'Contacts', icon: <ContactsIcon />, path: '/contacts' },
        { text: 'Templates', icon: <TemplatesIcon />, path: '/templates' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
        >
            <Toolbar />
            <List>
                {menuItems.map((item) => (
                    <Tooltip
                        key={item.text}
                        title={!isAuthenticated && !item.alwaysEnabled ? "Login to access" : ""}
                        placement="right"
                    >
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            disabled={!isAuthenticated && !item.alwaysEnabled}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </Tooltip>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;