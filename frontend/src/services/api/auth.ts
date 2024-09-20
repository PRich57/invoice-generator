import api from '../api';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { User } from '../../types';

export const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post(API_ENDPOINTS.LOGIN, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (response.data.access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }

    return response;
};

export const register = async (email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, { email, password });
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post(API_ENDPOINTS.LOGOUT);
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>(API_ENDPOINTS.ME);
    return response.data;
};

export const refreshToken = async () => {
    try {
        const response = await api.post(API_ENDPOINTS.REFRESH);
        if (response.data.access_token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        }
        return response;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};