import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Dashboard as DashboardIcon, Receipt as InvoicesIcon, Person as ContactsIcon, Description as TemplatesIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
        >
            <Toolbar /> {/* This pushes the content below the AppBar */}
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
        </Drawer>
    );
};

export default Sidebar;