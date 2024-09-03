export interface User {
    id: number;
    email: string;
    name?: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export interface Template {
    id: number;
    name: string;
    content: string;
    font_family: string;
    font_size: number;
    primary_color: string;
    secondary_color: string;
    logo_url?: string;
    custom_css?: string;
}

export interface TemplateCreate {
    name: string;
    content: string;
    font_family: string;
    font_size: number;
    primary_color: string;
    secondary_color: string;
    logo_url?: string;
    custom_css?: string;
}

export interface TemplateUpdate extends TemplateCreate {
    id: number;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    bill_to_id: number;
    send_to_id: number;
    tax_rate: number;
    discount_percentage: number;
    notes?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
}

export interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    subitems: InvoiceSubItem[];
    line_total: number;
}

export interface InvoiceSubItem {
    id: number;
    description: string;
}

export interface InvoiceCreate {
    invoice_number: string;
    invoice_date: string;
    bill_to_id: number;
    send_to_id: number;
    tax_rate: number;
    discount_percentage: number;
    notes?: string;
    items: Omit<InvoiceItem, 'id' | 'line_total'>[];
}

export interface InvoiceUpdate extends InvoiceCreate {
    id: number;
}

export interface Contact {
    id: number;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    street_address?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    type: 'bill_to' | 'send_to';
    notes?: string;
}

export interface ContactCreate {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    street_address?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    type: 'bill_to' | 'send_to';
    notes?: string;
}

export interface ContactUpdate extends ContactCreate {
    id: number;
}