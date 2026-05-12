import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
  requireLibrarian?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin, requireLibrarian }: Props) {
  const { isAuthenticated, isAdmin, isLibrarian } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (requireLibrarian && !isLibrarian) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
