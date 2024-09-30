import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { useAuth } from './contexts/AuthContext';
import theme from './styles/theme';
import routes from './constants/routes';
import ResponsiveLayout from './layouts/ResponsiveLayout';
import LoadingSpinner from './components/common/LoadingSpinner';
import 'react-toastify/dist/ReactToastify.css'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <SnackbarProvider maxSnack={3} anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}>
                    <Router>
                        <ResponsiveLayout>
                            <Suspense fallback={<LoadingSpinner />}>
                                <Routes>
                                    {routes.map((route) => (
                                        <Route 
                                            key={route.path} 
                                            path={route.path} 
                                            element={
                                                route.protected ? (
                                                    <ProtectedRoute>
                                                        <route.component />
                                                    </ProtectedRoute>
                                                ) : (
                                                    <route.component />
                                                )
                                            } 
                                        />
                                    ))}
                                </Routes>
                            </Suspense>
                        </ResponsiveLayout>
                    </Router>
                </SnackbarProvider>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;