import api from '../api';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { Invoice, InvoiceCreate } from '../../types';

export const getInvoices = async (params: {
    skip?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    group_by?: string[];
    invoice_number?: string;
    bill_to_name?: string;
    send_to_name?: string;
    date_from?: string;
    date_to?: string;
    total_min?: number;
    total_max?: number;
    client_type?: string;
    invoice_type?: string;
    status?: string;
}) => {

    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value) && value.length === 0) {
                return acc;
            }
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);    

    try {
        const response = await api.get<Invoice[]>(API_ENDPOINTS.INVOICES, { params: cleanParams });
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