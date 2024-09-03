import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints';
import { Invoice, InvoiceCreate, InvoiceUpdate, Contact, ContactCreate, ContactUpdate, Template, TemplateCreate, TemplateUpdate } from '../types';

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

export const getInvoices = () => api.get<Invoice[]>(API_ENDPOINTS.INVOICES);
export const getInvoice = (id: number) => api.get<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`);
export const createInvoice = (data: InvoiceCreate) => api.post<Invoice>(API_ENDPOINTS.INVOICES, data);
export const updateInvoice = (id: number, data: InvoiceUpdate) => api.put<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`, data);
export const deleteInvoice = (id: number) => api.delete(`${API_ENDPOINTS.INVOICES}/${id}`);

export const getContacts = () => api.get<Contact[]>(API_ENDPOINTS.CONTACTS);
export const getContact = (id: number) => api.get<Contact>(`${API_ENDPOINTS.CONTACTS}/${id}`);
export const createContact = (data: ContactCreate) => api.post<Contact>(API_ENDPOINTS.CONTACTS, data);
export const updateContact = (id: number, data: ContactUpdate) => api.put<Contact>(`${API_ENDPOINTS.CONTACTS}/${id}`, data);
export const deleteContact = (id: number) => api.delete(`${API_ENDPOINTS.CONTACTS}/${id}`);

export const getTemplates = () => api.get<Template[]>(API_ENDPOINTS.TEMPLATES);
export const getTemplate = (id: number) => api.get<Template>(`${API_ENDPOINTS.TEMPLATES}/${id}`);
export const createTemplate = (data: TemplateCreate) => api.post<Template>(API_ENDPOINTS.TEMPLATES, data);
export const updateTemplate = (id: number, data: TemplateUpdate) => api.put<Template>(`${API_ENDPOINTS.TEMPLATES}/${id}`, data);
export const deleteTemplate = (id: number) => api.delete(`${API_ENDPOINTS.TEMPLATES}/${id}`);

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