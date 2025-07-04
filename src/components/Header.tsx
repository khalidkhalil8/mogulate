
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import UserProfileDropdown from "./UserProfileDropdown";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
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
          {/* Only show navigation for signed-out users */}
          {!user && !isLoading && (
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={scrollToPricing}
                className="text-charcoal hover:text-teal-600 font-medium transition-colors"
              >
                Pricing
              </button>
            </nav>
          )}
          
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
        </div>
      </div>
    </header>
  );
};

export default Header;
