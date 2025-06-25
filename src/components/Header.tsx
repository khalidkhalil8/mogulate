
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import UserProfileDropdown from "./UserProfileDropdown";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const scrollToPricing = () => {
    if (window.location.pathname === '/') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  const handlePricingClick = () => {
    if (user) {
      navigate('/pricing');
    } else {
      scrollToPricing();
    }
  };

  const handleGetStartedClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  
  return (
    <header className="py-4 px-4 md:px-6 border-b shadow-sm">
      <div className="container-width flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="text-2xl font-bold bg-clip-text text-transparent gradient-bg">
            Mogulate
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-charcoal hover:text-teal-600 font-medium transition-colors"
            >
              Home
            </Link>
            <button
              onClick={handlePricingClick}
              className="text-charcoal hover:text-teal-600 font-medium transition-colors"
            >
              Pricing
            </button>
          </nav>
          
          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            <UserProfileDropdown />
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
            >
              Log In
            </Button>
          )}
          
          <div className="md:hidden">
            <button
              className="text-charcoal hover:text-teal-600 transition-colors"
              onClick={() => navigate('/')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
