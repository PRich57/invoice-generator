import api from './api';
import { API_ENDPOINTS, API_BASE_URL } from '../constants/apiEndpoints';
import { User } from '../types';

export const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post(API_ENDPOINTS.LOGIN, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response;
};

export const register = async (email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, { email, password });
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post(API_ENDPOINTS.LOGOUT);
};

export const getCurrentUser = async () => {
    const response = await api.get<User>(`${API_BASE_URL}/auth/me`);
    return response.data;
};