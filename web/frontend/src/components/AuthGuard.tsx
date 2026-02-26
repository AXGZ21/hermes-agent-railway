import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export const AuthGuard = () => {
  const { isAuthenticated, initialize } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initialize();
    setInitialized(true);
  }, [initialize]);

  // Don't redirect until we've checked localStorage
  if (!initialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
