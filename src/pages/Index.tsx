
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import HomePage from '@/components/HomePage';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Show homepage for non-authenticated users
  if (!user) {
    return <HomePage />;
  }

  // Redirect authenticated users to dashboard from root
  if (window.location.pathname === '/') {
    navigate('/dashboard');
    return null;
  }

  return null;
};

export default Index;
