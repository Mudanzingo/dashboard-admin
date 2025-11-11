import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppLayout } from '@/layout/AppLayout';
import LoginPage from '@/pages/login';
import CallbackPage from '@/pages/callback';
import DashboardPage from '@/pages/dashboard';
import ProductsPage from '@/pages/products';
import InventoryPage from '@/pages/inventory'; // Asegúrate de que el path exista; error previo puede deberse a caché de TS
import CategoriesPage from '@/pages/categories';
import ServicesPage from '@/pages/services';
import QuotesPage from '@/pages/quotes';
import SellersPage from '@/pages/sellers';
import ProvidersPage from '@/pages/providers';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/callback', element: <CallbackPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/products', element: <ProductsPage /> },
          { path: '/inventario', element: <InventoryPage /> },
          { path: '/categorias', element: <CategoriesPage /> },
          { path: '/servicios', element: <ServicesPage /> },
          { path: '/cotizaciones', element: <QuotesPage /> },
          { path: '/vendedores', element: <SellersPage /> },
          { path: '/proveedores', element: <ProvidersPage /> },
        ],
      },
    ],
  },
]);
