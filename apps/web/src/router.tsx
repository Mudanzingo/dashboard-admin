import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppLayout } from '@/layout/AppLayout';
import LoginPage from '@/pages/login';
import CallbackPage from '@/pages/callback';
import DashboardPage from '@/pages/dashboard';
import ProductsPage from '@/pages/products';

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
        ],
      },
    ],
  },
]);
