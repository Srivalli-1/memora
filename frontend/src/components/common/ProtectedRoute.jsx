import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#e8dfd1] border-t-[#e89da2] animate-spin" />
        <p className="mt-4 text-xs font-serif text-memora-muted italic">
          Opening your sanctuary... ♡
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
