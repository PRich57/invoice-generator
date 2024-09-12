import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/apiEndpoints';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add a request interceptor to include the token in subsequent requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_BASE_URL}/auth/token/refresh`, { refresh_token: refreshToken });

                const { access_token, refresh_token } = response.data;
                localStorage.setItem('token', access_token);
                localStorage.setItem('refresh_token', refresh_token);

                api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                if (!originalRequest.headers) {
                    originalRequest.headers = {};
                }

                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                return api(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login'; // Redirect to login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

export * from './authService';
export * from './contactService';
export * from './invoiceService';
export * from './templateService';