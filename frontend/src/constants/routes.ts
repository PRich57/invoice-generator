import { lazy } from 'react';

const Login = lazy(() => import('../pages/LoginPage'));
const Register = lazy(() => import('../pages/RegisterPage'));
const Dashboard = lazy(() => import('../pages/DashboardPage'));
const InvoicesList = lazy(() => import('../pages/InvoicesListPage'));
const InvoiceForm = lazy(() => import('../pages/InvoiceFormPage'));
const ContactsList = lazy(() => import('../pages/ContactsListPage'));
const ContactForm = lazy(() => import('../pages/ContactFormPage'));
const TemplatesList = lazy(() => import('../pages/TemplatesListPage'));
const TemplateForm = lazy(() => import('../pages/TemplateFormPage'));

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