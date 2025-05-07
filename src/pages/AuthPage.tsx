
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import AuthCard from '@/components/auth/AuthCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AuthPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthCard />
      </main>
    </div>
  );
};

export default AuthPage;
