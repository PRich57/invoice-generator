import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import theme from './styles/theme';
import routes from './constants/routes';
import Layout from './layouts/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <CssBaseline />
                    <Router>
                        <Layout>
                            <Suspense fallback={<LoadingSpinner />}>
                                <Routes>
                                    {routes.map((route) => (
                                        <Route key={route.path} path={route.path} element={<route.component />} />
                                    ))}
                                </Routes>
                            </Suspense>
                            <ToastContainer
                                position="bottom-right"
                                autoClose={5000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme="colored"
                                style={{ width: '300px' }}  // Adjust this value as needed
                            />
                        </Layout>
                    </Router>
                </LocalizationProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;