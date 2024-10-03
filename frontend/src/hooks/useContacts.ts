import { useState, useEffect, useCallback } from 'react';
import { Contact } from '../types';
import { getContacts } from '../services/api/contacts';
import { useErrorHandler } from './useErrorHandler';
import { useSnackbar } from 'notistack';

export const useContacts = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
    const [contactCount, setContactCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const { error, setError, handleError } = useErrorHandler();
    const { enqueueSnackbar } = useSnackbar();

    const fetchContacts = useCallback(async () => {
        try {
            setLoading(true);
            const contactsData = await getContacts();
            setContacts(contactsData);
            if (contactsData.length > 0) {
                setSelectedContact(contactsData[0]);
                setContactCount(contactsData.length)
            }
            setError(null);
        } catch (err) {
            handleError(err);
            enqueueSnackbar("Failed to fetch contacts. Please try again.",
                { variant: "error" }
            )
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const refetch = useCallback(() => {
        fetchContacts();
    }, [fetchContacts]);

    return { contacts, contactCount, selectedContact, setSelectedContact, error, loading, refetch };
};