import * as Yup from 'yup';

export const contactValidationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    company: Yup.string(),
    email: Yup.string().email('Invalid email'),
    phone: Yup.string(),
    street_address: Yup.string(),
    address_line2: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    postal_code: Yup.string(),
    country: Yup.string(),
    notes: Yup.string(),
});