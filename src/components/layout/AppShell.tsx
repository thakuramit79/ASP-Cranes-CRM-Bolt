import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  requiredRole?: 'sales_agent' | 'operations_manager' | 'operator';
}

export function AppShell({ requiredRole }: AppShellProps) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  
  // Check if token is valid
  React.useEffect(() => {
    if (!checkAuth()) {
      navigate('/login');
    }
  }, [checkAuth, navigate]);
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If requiredRole is specified and user role doesn't match, redirect to dashboard
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}