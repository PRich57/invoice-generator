import api from '../api';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { User } from '../../types/user';
import { AxiosError } from 'axios';

export const login = async (email: string, password: string): Promise<void> => {
    await api.post(API_ENDPOINTS.LOGIN, { username: email, password }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const register = async (email: string, password: string): Promise<User> => {
    const response = await api.post<User>(API_ENDPOINTS.REGISTER, { email, password });
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post(API_ENDPOINTS.LOGOUT);
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const response = await api.get<User>(API_ENDPOINTS.ME);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
            return null;
        }
        throw error;
    }
};

export const refreshToken = async (): Promise<void> => {
    await api.post(API_ENDPOINTS.REFRESH);
};