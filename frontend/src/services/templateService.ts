import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { Template, TemplateCreate, TemplateUpdate } from '../types';

export const getTemplates = async () => {
    const response = await api.get<Template[]>(API_ENDPOINTS.TEMPLATES);
    return response.data;
};

export const getTemplate = async (id: number) => {
    const response = await api.get<Template>(`${API_ENDPOINTS.TEMPLATES}/${id}`);
    return response.data;
};

export const createTemplate = async (data: TemplateCreate) => {
    console.log('Attempting to create template:', data);
    const response = await api.post<Template>(API_ENDPOINTS.TEMPLATES, data);
    console.log('Template created successfully:', response.data);
    return response.data;
};

export const updateTemplate = async (id: number, data: TemplateUpdate) => {
    const response = await api.put<Template>(`${API_ENDPOINTS.TEMPLATES}/${id}`, data);
    return response.data;
};

export const deleteTemplate = async (id: number) => {
    const response = await api.delete(`${API_ENDPOINTS.TEMPLATES}/${id}`);
    return response.data;
};

export const customizeTemplate = async (templateId: number, templateData: TemplateUpdate) => {
    const response = await api.put<Template>(`${API_ENDPOINTS.TEMPLATES}/${templateId}/customize`, templateData);
    return response.data;
};