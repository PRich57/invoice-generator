import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import * as api from '../services/api';
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
            const user = await api.getCurrentUser();
            setUser(user);
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await api.login(email, password);
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
            await api.logout();
            setIsAuthenticated(false);
            setUser(null);
            enqueueSnackbar('Logged out successfully', { variant: 'success' });
        } catch (error) {
            handleError(error);
        }
    };

    const refreshToken = async () => {
        try {
            await api.refreshToken();
            await checkAuthStatus();
        } catch (error) {
            handleError(error);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, refreshToken }}>
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