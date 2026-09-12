import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="route-loading">Loading…</div>;
  }

  if (user) {
    return <Navigate to="/notes" replace />;
  }

  return <Outlet />;
}
