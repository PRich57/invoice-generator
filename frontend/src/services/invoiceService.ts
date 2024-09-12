import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { Invoice, InvoiceCreate } from '../types';

export const getInvoices = async () => {
    const response = await api.get<Invoice[]>(API_ENDPOINTS.INVOICES);
    return response.data;
};

export const getInvoice = async (id: number) => {
    const response = await api.get<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`);
    return response.data;
};

export const createInvoice = async (data: InvoiceCreate) => {
    const response = await api.post<Invoice>(API_ENDPOINTS.INVOICES, data);
    return response.data;
};

export const updateInvoice = async (id: number, data: InvoiceCreate) => {
    const response = await api.put<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`, data);
    return response.data;
};

export const deleteInvoice = async (id: number) => {
    const response = await api.delete(`${API_ENDPOINTS.INVOICES}/${id}`);
    return response.data;
};

export const generateInvoicePDF = async (invoiceId: number, templateId: number) => {
    const response = await api.get(`${API_ENDPOINTS.INVOICES}/${invoiceId}/pdf?template_id=${templateId}`, { responseType: 'blob' });
    return response.data;
};

export const previewInvoicePDF = async (invoice: InvoiceCreate, templateId: number) => {
    const response = await api.post(`${API_ENDPOINTS.INVOICES}/preview-pdf?template_id=${templateId}`, invoice, { responseType: 'blob' });
    return response.data;
};