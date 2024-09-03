import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
});

export const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    // Store token in localStorage
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }

    return response.data;
};

export const register = async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
};

api.defaults.headers.common['Content-Type'] = 'application/json';

// Contact API endpoints
export const getContacts = () => api.get('/contacts');
export const getContact = (id: number) => api.get(`/contacts/${id}`);
export const createContact = (data: any) => api.post('/contacts', data);
export const updateContact = (id: number, data: any) => api.put(`/contacts/${id}`, data);
export const deleteContact = (id: number) => api.delete(`/contacts/${id}`);

// Invoice API endpoints
export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id: number) => api.get(`/invoices/${id}`);
export const createInvoice = (data: any) => api.post('/invoices', data);
export const updateInvoice = (id: number, data: any) => api.put(`/invoices/${id}`, data);
export const deleteInvoice = (id: number) => api.delete(`/invoices/${id}`);

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

export default api;