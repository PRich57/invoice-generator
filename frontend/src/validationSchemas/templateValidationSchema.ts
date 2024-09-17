import * as Yup from 'yup';

export const templateValidationSchema = Yup.object().shape({
    name: Yup.string().required('Template name is required'),
    colors: Yup.object({
        primary: Yup.string().required('Primary color is required'),
        secondary: Yup.string().required('Secondary color is required'),
        accent: Yup.string().required('Accent color is required'),
    }),
    fonts: Yup.object({
        main: Yup.string().required('Main font is required'),
        accent: Yup.string().required('Accent font is required'),
    }),
    font_sizes: Yup.object({
        title: Yup.number().required('Title font size is required'),
        invoice_number: Yup.number().required('Invoice number font size is required'),
        section_header: Yup.number().required('Section header font size is required'),
        table_header: Yup.number().required('Table header font size is required'),
        normal_text: Yup.number().required('Normal text font size is required'),
    }),
    layout: Yup.object({
        page_size: Yup.string().required('Page size is required'),
        margin_top: Yup.number().required('Top margin is required'),
        margin_right: Yup.number().required('Right margin is required'),
        margin_bottom: Yup.number().required('Bottom margin is required'),
        margin_left: Yup.number().required('Left margin is required'),
    }),
    custom_css: Yup.string().nullable(),
});
