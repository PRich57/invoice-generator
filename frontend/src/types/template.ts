export interface Template {
    id: number;
    user_id: number;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
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