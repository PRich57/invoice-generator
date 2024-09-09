export const createDynamicStyle = (template: any) => `
    @media print {
        .invoice-preview {
        font-family: ${template.fonts.main};
        color: ${template.colors.primary};
        }
        .invoice-title {
        font-size: ${template.font_sizes.title}pt;
        color: ${template.colors.primary};
        }
        .invoice-subtitle {
        font-size: ${template.font_sizes.invoice_number}pt;
        color: ${template.colors.secondary};
        }
        .section-header {
        font-size: ${template.font_sizes.section_header}pt;
        color: ${template.colors.accent};
        }
        .table-header {
        background-color: ${template.colors.accent};
        color: white;
        }
        .table-cell {
        font-size: ${template.font_sizes.normal_text}pt;
        }
    }
`;

// Need to add more styles based on the template's structure