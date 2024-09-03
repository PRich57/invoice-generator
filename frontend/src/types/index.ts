export interface User {
    id: number;
    email: string;
    name?: string;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    date: string;
    due_date: string;
    total: number;
    status: 'draft' | 'sent' | 'paid';
    client_id: number;
}

export interface Contact {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export interface Template {
    id: number;
    name: string;
    content: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}