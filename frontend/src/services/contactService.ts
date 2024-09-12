import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { Contact, ContactCreate, ContactUpdate } from '../types';

export const getContacts = async () => {
    const response = await api.get<Contact[]>(API_ENDPOINTS.CONTACTS);
    return response.data;
};

export const getContact = async (id: number) => {
    const response = await api.get<Contact>(`${API_ENDPOINTS.CONTACTS}/${id}`);
    return response.data;
};

export const createContact = async (data: ContactCreate) => {
    const response = await api.post<Contact>(API_ENDPOINTS.CONTACTS, data);
    return response.data;
};

export const updateContact = async (id: number, data: ContactUpdate) => {
    const response = await api.put<Contact>(`${API_ENDPOINTS.CONTACTS}/${id}`, data);
    return response.data;
};

export const deleteContact = async (id: number) => {
    const response = await api.delete(`${API_ENDPOINTS.CONTACTS}/${id}`);
    return response.data;
};