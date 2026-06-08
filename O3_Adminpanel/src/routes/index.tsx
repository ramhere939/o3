import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import Dashboard from '@/pages/dashboard/Dashboard';
import KycQueue from '@/pages/kyc/KycQueue';
import CatalogQueue from '@/pages/catalog/CatalogQueue';
import DisputeQueue from '@/pages/disputes/DisputeQueue';
import MasterDataQueue from '@/pages/masters/MasterDataQueue';
import AdminUsersList from '@/pages/admin-users/AdminUsersList';
import LoginPage from '@/pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p>Module implementation coming soon.</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin/dashboard" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'kyc', element: <KycQueue /> },
          { path: 'catalog', element: <CatalogQueue /> },
          { path: 'disputes', element: <DisputeQueue /> },
          { path: 'masters/chemicals', element: <MasterDataQueue /> },
          { path: 'admin-users', element: <AdminUsersList /> },
          { path: 'audit-logs', element: <Placeholder title="Audit Logs" /> },
          { path: 'notifications', element: <Placeholder title="Notifications" /> },
          { path: 'settings', element: <Placeholder title="Settings" /> },
        ]
      }
    ]
  }
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
