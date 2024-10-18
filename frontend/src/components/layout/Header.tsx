import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme, Box } from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleLogoutOrLogin = async () => {
        if (isAuthenticated) {
            await logout();
        }
        navigate('/login');
    };

    return (
        <AppBar position="fixed" sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(5px)',
        }}>
            <Toolbar>
                {isMobile && (
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
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