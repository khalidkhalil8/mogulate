
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import HomePage from '@/components/HomePage';

const Index = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Always show the homepage - no automatic redirect for authenticated users
  return <HomePage />;
};

export default Index;
