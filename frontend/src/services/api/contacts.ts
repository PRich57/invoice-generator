import api from '../api';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { Contact, ContactCreate, ContactUpdate } from '../../types';

export const getContacts = async () => {
    try {
        const response = await api.get<Contact[]>(API_ENDPOINTS.CONTACTS);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getContact = async (id: number) => {
    try {
        const response = await api.get<Contact>(`${API_ENDPOINTS.CONTACTS}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createContact = async (data: ContactCreate) => {
    try {
        const response = await api.post<Contact>(API_ENDPOINTS.CONTACTS, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateContact = async (id: number, data: ContactUpdate) => {
    try {
        const response = await api.put<Contact>(`${API_ENDPOINTS.CONTACTS}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteContact = async (id: number) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.CONTACTS}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};