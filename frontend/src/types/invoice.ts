import { Contact, Template } from ".";

export interface InvoiceSubItemCreate {
    id?: number;
    description: string;
}

export interface InvoiceSubItem {
    id: number;
    description: string;
}

export interface InvoiceItemCreate {
    id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    subitems: InvoiceSubItemCreate[];
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    subitems: InvoiceSubItem[];
    line_total: number;
}

export interface InvoiceCreate {
    invoice_number: string;
    invoice_date: string;
    bill_to_id: number;
    send_to_id: number;
    tax_rate: number;
    discount_percentage: number;
    notes?: string;
    items: InvoiceItemCreate[];
    template_id: number;
}

export interface Invoice {
    id: number;
    user_id: number;
    invoice_number: string;
    invoice_date: string;
    bill_to_id: number;
    send_to_id: number;
    tax_rate: number;
    discount_percentage: number;
    notes?: string;
    items: InvoiceItem[];
    template_id: number;
    subtotal: number;
    tax: number;
    total: number;
}

export interface InvoicePreviewProps {
    invoice: Invoice | InvoiceCreate;
    template: Template;
    billToContact?: Contact | null;
    sendToContact?: Contact | null;
}

export type InvoiceFormErrors = {
    invoice_number?: string;
    invoice_date?: string;
    bill_to_id?: string;
    send_to_id?: string;
    tax_rate?: string;
    discount_percentage?: string;
    notes?: string;
    items?: {
        description?: string;
        quantity?: string;
        unit_price?: string;
        discount_percentage?: string;
        subitems?: {
            description?: string;
        }[];
    }[];
};