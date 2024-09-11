import { useState } from 'react';
import { InvoiceCreate, Template } from '../types';
import { previewInvoicePDF } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const usePDFGeneration = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { handleError } = useErrorHandler();

    const handlePrintToPDF = async (invoice: InvoiceCreate, selectedTemplate: Template | null, id?: string) => {
        if (!selectedTemplate) return;

        try {
            setIsSubmitting(true);
            let pdfContent: Blob;
            if (id) {
                const updatedInvoice = {
                    ...invoice,
                    id: parseInt(id)
                };
                const response = await previewInvoicePDF(updatedInvoice, selectedTemplate.id);
                pdfContent = new Blob([response.data], { type: 'application/pdf' });
            } else {
                const response = await previewInvoicePDF(invoice, selectedTemplate.id);
                pdfContent = new Blob([response.data], { type: 'application/pdf' });
            }
            const url = window.URL.createObjectURL(pdfContent);
            window.open(url);
        } catch (error) {
            handleError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { handlePrintToPDF, isSubmitting };
};