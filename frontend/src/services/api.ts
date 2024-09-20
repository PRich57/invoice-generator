import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/apiEndpoints';
import { refreshToken } from './api/auth';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    } else {
                        originalRequest.headers = { 'Authorization': 'Bearer ' + token };
                    }
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise((resolve, reject) => {
                refreshToken()
                    .then(({ data }) => {
                        api.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
                        if (originalRequest.headers) {
                            originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
                        } else {
                            originalRequest.headers = { 'Authorization': 'Bearer ' + data.access_token };
                        }
                        processQueue(null, data.access_token);
                        resolve(api(originalRequest));
                    })
                    .catch((err) => {
                        processQueue(err, null);
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject(error);
    }
);

export default api;

export * from './api/auth';
export * from './api/contacts';
export * from './api/invoices';
export * from './api/templates';