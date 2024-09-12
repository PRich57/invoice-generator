import { useState, useEffect, useCallback } from 'react';
import { Template } from '../types';
import { getTemplates } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const { error, setError, handleError } = useErrorHandler();

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const templatesData = await getTemplates();
            setTemplates(templatesData);
            if (templatesData.length > 0) {
                setSelectedTemplate(templatesData[0]);
            }
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const getTemplateById = useCallback((id: number) => {
        return templates.find(template => template.id === id) || null;
    }, [templates]);

    const refetch = useCallback(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return { templates, selectedTemplate, setSelectedTemplate, error, loading, refetch, getTemplateById };
};