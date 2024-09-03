import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import theme from './styles/theme';
import routes from './constants/routes';
import Layout from './layouts/MainLayout';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <Router>
                    <Layout>
                        <Suspense fallback={<CircularProgress />}>
                            <Routes>
                                {routes.map((route) => (
                                    <Route key={route.path} path={route.path} element={<route.component />} />
                                ))}
                            </Routes>
                        </Suspense>
                    </Layout>
                </Router>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;