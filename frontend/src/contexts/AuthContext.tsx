import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import * as api from '../services/api';
import { useSnackbar } from 'notistack';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { enqueueSnackbar } = useSnackbar();

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
            const user = await api.getCurrentUser();
            setUser(user);
            setIsAuthenticated(true);
            enqueueSnackbar('Logged in successfully', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Login failed. Please check your credentials.', { variant: 'error' });
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
            enqueueSnackbar('Logged out successfully', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Logout failed. Please try again.', { variant: 'error' });
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
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