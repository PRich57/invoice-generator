import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types/user';
import api from '../services/api';
import { login as loginApi, logout as logoutApi, getCurrentUser, refreshToken } from '../services/api/auth';
import { useSnackbar } from 'notistack';
import { useErrorHandler } from '../hooks/useErrorHandler';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { enqueueSnackbar } = useSnackbar();
    const { handleError } = useErrorHandler();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Authentication check failed:', error);
            enqueueSnackbar('Session expired. Please log in again.', { variant: 'warning' });
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await loginApi(email, password);
            await checkAuthStatus();
            enqueueSnackbar('Logged in successfully', { variant: 'success' });
        } catch (error) {
            handleError(error);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
            setIsAuthenticated(false);
            setUser(null);
            enqueueSnackbar('Logged out successfully', { variant: 'success' });
        } catch (error) {
            handleError(error);
        }
    };

    const refreshTokenHandler = async () => {
        try {
            await refreshToken();
            await checkAuthStatus();
        } catch (error) {
            handleError(error);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, refreshToken: refreshTokenHandler }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};