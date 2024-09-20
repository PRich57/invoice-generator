import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Logout as LogoutIcon, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogoutOrLogin = async () => {
        if (isAuthenticated) {
            await logout();
        }
        navigate('/login');
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Invoice Generator
                </Typography>
                <IconButton color="inherit" onClick={handleLogoutOrLogin}>
                    {isAuthenticated ? <LogoutIcon /> : <LoginIcon />} 
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;