import api from '../api';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { Template, TemplateCreate } from '../../types';

export const getTemplates = async () => {
    try {
        const response = await api.get<Template[]>(API_ENDPOINTS.TEMPLATES);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTemplate = async (id: number) => {
    try {
        const response = await api.get<Template>(`${API_ENDPOINTS.TEMPLATES}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTemplate = async (data: TemplateCreate) => {
    try {
        const response = await api.post<Template>(API_ENDPOINTS.TEMPLATES, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTemplate = async (id: number, data: TemplateCreate) => {
    try {
        const response = await api.put<Template>(`${API_ENDPOINTS.TEMPLATES}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteTemplate = async (id: number) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.TEMPLATES}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const customizeTemplate = async (templateId: number, templateData: TemplateCreate) => {
    try {
        const response = await api.put<Template>(`${API_ENDPOINTS.TEMPLATES}/${templateId}/customize`, templateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};