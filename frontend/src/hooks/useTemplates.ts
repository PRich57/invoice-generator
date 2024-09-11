import { useState, useEffect } from 'react';
import { Template } from '../types';
import { getTemplates } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const { handleError } = useErrorHandler();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await getTemplates();
                setTemplates(response.data);
                if (response.data.length > 0) {
                    setSelectedTemplate(response.data[0]);
                }
            } catch (err) {
                handleError(err);
            }
        };
        fetchTemplates();
    }, []);

    return { templates, selectedTemplate, setSelectedTemplate };
};