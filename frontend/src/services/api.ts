import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants/apiEndpoints';
import { refreshToken as refreshTokenService } from './api/auth';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await refreshTokenService();
                return api(originalRequest);
            } catch (refreshError) {
                // Optionally handle logout or redirect to login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
