export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/token`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    INVOICES: `${API_BASE_URL}/invoices`,
    CONTACTS: `${API_BASE_URL}/contacts`,
    TEMPLATES: `${API_BASE_URL}/templates`,
};