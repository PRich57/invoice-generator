import { useState } from 'react';
import { InvoiceCreate, Template } from '../types';
import { previewInvoicePDF } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const usePDFGeneration = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { handleError } = useErrorHandler();

    const handlePreviewPDF = async (invoice: InvoiceCreate, selectedTemplate: Template | null, id?: string) => {
        if (!selectedTemplate) {
            handleError(new Error('No template selected'));
            return;
        }

        try {
            setIsGenerating(true);
            const response = await previewInvoicePDF(invoice, selectedTemplate.id);
            
            // Create a Blob from the PDF stream
            const blob = new Blob([response], { type: 'application/pdf' });
            
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Open the PDF in a new tab
            window.open(url, '_blank');
        } catch (error) {
            handleError(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return { handlePreviewPDF, isGenerating };
};