import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import * as api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const user = await api.getCurrentUser();
                setUser(user);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to verify token:', error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.login(email, password);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            setIsAuthenticated(true);

            // Fetch user details after successful login
            const userResponse = await api.getCurrentUser();
            setUser(userResponse);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('token');
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