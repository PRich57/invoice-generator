import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { Box } from '@mui/material';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNavigation from '../components/layout/BottomNavigation';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', marginBottom: '5rem' }}>
            <Header />
            <Box sx={{ display: 'flex', flex: 1 }}>
                {!isMobile && <Sidebar />}
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                    {children}
                </Box>
            </Box>
            {isMobile && <BottomNavigation />}
        </Box>
    );
};

export default ResponsiveLayout;