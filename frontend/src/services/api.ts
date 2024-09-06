import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints';
import { User, Invoice, InvoiceCreate, Contact, ContactCreate, ContactUpdate, Template, TemplateCreate, TemplateUpdate } from '../types';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

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

// Get current authenticated user
export const getCurrentUser = () => api.get<User>(`${API_BASE_URL}/auth/me`);

// Invoices
export const getInvoices = () => api.get<Invoice[]>(API_ENDPOINTS.INVOICES);
export const getInvoice = (id: number) => api.get<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`);
export const createInvoice = (data: InvoiceCreate) => api.post<Invoice>(API_ENDPOINTS.INVOICES, data);
export const updateInvoice = (id: number, data: InvoiceCreate) => api.put<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`, data);
export const deleteInvoice = (id: number) => api.delete(`${API_ENDPOINTS.INVOICES}/${id}`);

// Contacts
export const getContacts = () => api.get<Contact[]>(API_ENDPOINTS.CONTACTS);
export const getContact = (id: number) => api.get<Contact>(`${API_ENDPOINTS.CONTACTS}/${id}`);
export const createContact = (data: ContactCreate) => api.post<Contact>(API_ENDPOINTS.CONTACTS, data);
export const updateContact = (id: number, data: ContactUpdate) => api.put<Contact>(`${API_ENDPOINTS.CONTACTS}/${id}`, data);
export const deleteContact = (id: number) => api.delete(`${API_ENDPOINTS.CONTACTS}/${id}`);

// Templates
export const getTemplates = () => api.get<Template[]>(API_ENDPOINTS.TEMPLATES);
export const getTemplate = (id: number) => api.get<Template>(`${API_ENDPOINTS.TEMPLATES}/${id}`);
export const createTemplate = (data: TemplateCreate) => api.post<Template>(API_ENDPOINTS.TEMPLATES, data);
export const updateTemplate = (id: number, data: TemplateUpdate) => api.put<Template>(`${API_ENDPOINTS.TEMPLATES}/${id}`, data);
export const deleteTemplate = (id: number) => api.delete(`${API_ENDPOINTS.TEMPLATES}/${id}`);

// PDF Generation
export const generateInvoicePDF = (invoiceId: number, templateId: number) => 
    api.get(`${API_ENDPOINTS.INVOICES}/${invoiceId}/pdf?template_id=${templateId}`, { responseType: 'blob' });

// Preview invoice
export const previewInvoice = (data: InvoiceCreate) => 
    axios.post<Invoice>(`${API_ENDPOINTS.INVOICES}/preview`, data);

// Customize template
export const customizeTemplate = (templateId: number, templateData: TemplateUpdate) =>
    api.put<Template>(`${API_ENDPOINTS.TEMPLATES}/${templateId}/customize`, templateData);

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