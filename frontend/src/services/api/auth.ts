import api from '../api';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { User, LoginResponse, RefreshTokenResponse } from '../../types/user';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
    }

    return response.data;
};

export const register = async (email: string, password: string): Promise<User> => {
    const response = await api.post<User>(API_ENDPOINTS.REGISTER, { email, password });
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post(API_ENDPOINTS.LOGOUT);
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>(API_ENDPOINTS.ME);
    return response.data;
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
    try {
        const response = await api.post<RefreshTokenResponse>(API_ENDPOINTS.REFRESH);
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
        }
        return response.data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};