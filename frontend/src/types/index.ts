export interface User {
    id: number;
    email: string;
    name?: string;
}

export interface Contact {
    id: number;
    user_id: number;
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

export interface ContactCreate extends Omit<Contact, 'id' | 'user_id'> {}

export interface ContactUpdate extends Partial<ContactCreate> {
    id: number;
}

export interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    subitems: InvoiceSubItem[];
}

export interface InvoiceSubItem {
    id: number;
    description: string;
}

export interface Invoice {
    id: number;
    user_id: number;
    template_id: number;
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
    total: string;
}

export interface InvoiceCreate extends Pick<Invoice, 'invoice_number' | 'template_id' | 'invoice_date' | 'bill_to_id' | 'send_to_id' | 'tax_rate' | 'discount_percentage' | 'notes' | 'items'> {}

export interface InvoiceUpdate extends Partial<InvoiceCreate> {
    id: number;
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

export interface Template {
    id: number;
    user_id: number;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    fonts: {
        main: string;
        accent: string;
    };
    font_sizes: {
        title: number;
        invoice_number: number;
        section_header: number;
        table_header: number;
        normal_text: number;
    };
    layout: {
        page_size: string;
        margin_top: number;
        margin_right: number;
        margin_bottom: number;
        margin_left: number;
    };
    custom_css?: string;
}

export interface TemplateCreate extends Omit<Template, 'id' | 'user_id'> {}

export interface TemplateUpdate extends Partial<TemplateCreate> {
    id: number;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}