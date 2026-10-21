import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../data/constants';
import type { Role } from '../types';

export default function ProtectedRoute({ role }: { role: Role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleHome[user.role]} replace />;
  return <Outlet />;
}
