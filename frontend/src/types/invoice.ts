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
    quantity: number | null;
    unit_price: number | null;
    discount_percentage: number | null;
    subitems: InvoiceSubItemCreate[];
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    description: string;
    quantity: number | null;
    unit_price: number | null;
    discount_percentage: number | null;
    subitems: InvoiceSubItem[];
    line_total: number;
}

export interface InvoiceCreate {
    invoice_number: string;
    invoice_date: string;
    bill_to_id: number | null;
    send_to_id: number | null;
    tax_rate: number;
    discount_percentage: number;
    notes?: string;
    items: InvoiceItemCreate[];
    template_id: number | null;
}

export interface Invoice {
    id: number;
    user_id: number;
    invoice_number: string;
    invoice_date: string;
    bill_to_id: number;
    bill_to_name: string;
    send_to_id: number;
    send_to_name: string;
    tax_rate: number;
    discount_percentage: number;
    notes?: string;
    items: InvoiceItem[];
    template_id: number;
    template_name: string;
    subtotal: number;
    tax: number;
    total: number;
    client_type?: string;
    invoice_type?: string;
    status?: string;
}

export interface GroupedInvoices {
    [groupKey: string]: {
        invoice_count: number;
        total_amount: number;
    }
}

export interface InvoiceFilters {
    invoice_number?: string;
    bill_to_name?: string;
    send_to_name?: string;
    client_type?: string;
    invoice_type?: string;
    date_from?: string;
    date_to?: string;
    total_min?: string;
    total_max?: string;
    status?: string;
}

export interface InvoicePreviewProps {
    invoice: Invoice | InvoiceCreate;
    template: Template;
    billToContact?: Contact | null;
    sendToContact?: Contact | null;
}

export interface InvoiceItemFieldsProps {
    index: number;
    remove: (index: number) => void;
}

export interface InvoiceFormProps {
    contacts: Contact[];
    templates: Template[];
    isSubmitting: boolean;
    setSelectedTemplate: (template: Template | null) => void;
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