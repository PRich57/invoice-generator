import * as Yup from 'yup';

export const invoiceValidationSchema = Yup.object().shape({
    invoice_number: Yup.string().required('Invoice number is required'),
    invoice_date: Yup.date().required('Invoice date is required'),
    bill_to_id: Yup.number().required('Bill to contact is required'),
    send_to_id: Yup.number().required('Send to contact is required'),
    tax_rate: Yup.number().min(0, 'Tax rate must be non-negative').max(100, 'Tax rate must not exceed 100').required('Tax rate is required'),
    discount_percentage: Yup.number().min(0, 'Discount must be non-negative').max(100, 'Discount must not exceed 100'),
    notes: Yup.string(),
    items: Yup.array().of(
        Yup.object().shape({
            description: Yup.string().required('Item description is required'),
            quantity: Yup.number().required('Quantity is required').min(0, 'Quantity must be non-negative'),
            unit_price: Yup.number().required('Unit price is required').min(0, 'Unit price must be non-negative'),
            discount_percentage: Yup.number().min(0, 'Discount must be non-negative').max(100, 'Discount must not exceed 100'),
            subitems: Yup.array().of(
                Yup.object().shape({
                    description: Yup.string().required('Subitem description is required'),
                })
            ),
        })
    ).min(1, 'At least one item is required'),
});