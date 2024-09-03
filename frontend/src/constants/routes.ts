import { lazy } from 'react';

const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const InvoicesList = lazy(() => import('../pages/InvoicesList'));
const InvoiceForm = lazy(() => import('../pages/InvoiceForm'));

const routes = [
    { path: '/login', component: Login },
    { path: '/dashboard', component: Dashboard },
    { path: '/invoices', component: InvoicesList },
    { path: '/invoices/new', component: InvoiceForm },
    { path: '/invoices/edit/:id', component: InvoiceForm },
    { path: '/', component: Dashboard },
];

export default routes;