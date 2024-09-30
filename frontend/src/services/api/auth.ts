import api from '../api';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { User } from '../../types/user';

export const login = async (email: string, password: string): Promise<void> => {
    const loginData = {
        email,
        password,
    };

    await api.post(API_ENDPOINTS.LOGIN, loginData);
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

export const refreshToken = async (): Promise<void> => {
    await api.post(API_ENDPOINTS.REFRESH);
};
