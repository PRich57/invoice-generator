import { useState, useEffect } from 'react';
import { Contact } from '../types';
import { getContacts } from '../services/api';

export const useContacts = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await getContacts();
                setContacts(response.data);
            } catch (err) {
                setError('Failed to fetch contacts. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    return { contacts, error, loading };
};