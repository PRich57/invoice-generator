import { lazy } from 'react';

const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const InvoicesList = lazy(() => import('../pages/InvoicesList'));
const InvoiceForm = lazy(() => import('../pages/InvoiceForm'));
const ContactsList = lazy(() => import('../pages/ContactsList'));
const ContactForm = lazy(() => import('../pages/ContactForm'));
const TemplatesList = lazy(() => import('../pages/TemplatesList'));
const TemplateForm = lazy(() => import('../pages/TemplateForm'));

const routes = [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', component: Dashboard },
    { path: '/invoices', component: InvoicesList },
    { path: '/invoices/new', component: InvoiceForm },
    { path: '/invoices/edit/:id', component: InvoiceForm },
    { path: '/contacts', component: ContactsList },
    { path: '/contacts/new', component: ContactForm },
    { path: '/contacts/edit/:id', component: ContactForm },
    { path: '/templates', component: TemplatesList },
    { path: '/templates/new', component: TemplateForm },
    { path: '/templates/edit/:id', component: TemplateForm },
    { path: '/', component: Dashboard },
];

export default routes;