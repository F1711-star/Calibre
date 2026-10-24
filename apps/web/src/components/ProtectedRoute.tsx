import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'learner' | 'manager' }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
