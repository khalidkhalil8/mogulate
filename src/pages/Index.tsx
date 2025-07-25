
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import HomePage from '@/components/HomePage';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Only redirect if we're actually on the root path and user is authenticated
  useEffect(() => {
    if (!isLoading && user && location.pathname === '/') {
      console.log('Index: Redirecting authenticated user to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

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

  // If we're on the root path and user is authenticated, show loading while redirect happens
  if (location.pathname === '/') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // For any other path, don't render anything (let other routes handle it)
  return null;
};

export default Index;
