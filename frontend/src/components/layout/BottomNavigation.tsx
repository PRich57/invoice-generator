import React from 'react';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Dashboard, Description, Contacts, ColorLens } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <MuiBottomNavigation
                value={location.pathname}
                onChange={(event, newValue) => {
                    navigate(newValue);
                }}
                showLabels
            >
                <BottomNavigationAction label="Dashboard" icon={<Dashboard />} value="/dashboard" />
                <BottomNavigationAction label="Invoices" icon={<Description />} value="/invoices" />
                <BottomNavigationAction label="Contacts" icon={<Contacts />} value="/contacts" />
                <BottomNavigationAction label="Templates" icon={<ColorLens />} value="/templates" />
            </MuiBottomNavigation>
        </Paper>
    );
};

export default BottomNavigation;