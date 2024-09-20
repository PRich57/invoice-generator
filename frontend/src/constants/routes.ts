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
    { path: '/login', component: Login, protected: false },
    { path: '/register', component: Register, protected: false },
    { path: '/dashboard', component: Dashboard, protected: false },
    { path: '/invoices', component: InvoicesList, protected: true },
    { path: '/invoices/new', component: InvoiceForm, protected: false },
    { path: '/invoices/edit/:id', component: InvoiceForm, protected: true },
    { path: '/contacts', component: ContactsList, protected: true },
    { path: '/contacts/new', component: ContactForm, protected: true },
    { path: '/contacts/edit/:id', component: ContactForm, protected: true },
    { path: '/templates', component: TemplatesList, protected: true },
    { path: '/templates/new', component: TemplateForm, protected: true },
    { path: '/templates/edit/:id', component: TemplateForm, protected: true },
    { path: '/', component: Dashboard, protected: false },
];

export default routes;