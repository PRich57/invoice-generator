import React from 'react';
import { Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Toolbar /> {/* This empty Toolbar acts as a spacer */}
            <Box sx={{ display: 'flex', flex: 1 }}>
                {!isMobile && <Sidebar />}
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', marginBottom: isMobile ? '56px' : '0' }}>
                    {children}
                </Box>
            </Box>
            {isMobile && <BottomNavigation />}
        </Box>
    );
};

export default ResponsiveLayout;