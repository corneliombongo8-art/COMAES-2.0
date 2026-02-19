import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/entrar" replace />;

  // Accept either explicit role or boolean flag used elsewhere in the app
  const isAdmin = user?.role === 'admin' || user?.isAdmin || user?.funcao_id === 3 || user?.funcao?.nome === 'Administrador';

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedAdminRoute;
