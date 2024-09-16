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
    notes?: string;
}

export interface ContactCreate extends Omit<Contact, 'id' | 'user_id'> {}

export interface ContactUpdate extends Partial<ContactCreate> {
    id: number;
}