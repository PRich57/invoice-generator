import api from '../api';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { Invoice, InvoiceCreate } from '../../types';

export const getInvoices = async () => {
    try {
        const response = await api.get<Invoice[]>(API_ENDPOINTS.INVOICES);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getInvoice = async (id: number) => {
    try {
        const response = await api.get<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createInvoice = async (data: InvoiceCreate) => {
    try {

        const response = await api.post<Invoice>(API_ENDPOINTS.INVOICES, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateInvoice = async (id: number, data: InvoiceCreate) => {
    try {
        const response = await api.put<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteInvoice = async (id: number) => {
    try {
        await api.delete(`${API_ENDPOINTS.INVOICES}/${id}`);
    } catch (error) {
        throw error;
    }
};

export const generateInvoicePDF = async (invoiceId: number, templateId: number) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.INVOICES}/${invoiceId}/pdf?template_id=${templateId}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const previewInvoicePDF = async (invoice: InvoiceCreate, templateId: number) => {
    try {
        const response = await api.post(`${API_ENDPOINTS.INVOICES}/preview-pdf?template_id=${templateId}`, invoice, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};