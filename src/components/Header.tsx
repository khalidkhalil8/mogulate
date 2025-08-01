
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import UserProfileDropdown from "./UserProfileDropdown";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFeedback = () => {
    window.open('https://forms.google.com/feedback', '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="py-3 md:py-4 mobile-padding border-b shadow-sm bg-white">
      <div className="container-width flex items-center justify-between">
        <Link to="/" className="flex items-center focus-ring rounded-lg p-1">
          <div className="text-xl md:text-2xl font-bold bg-clip-text text-transparent gradient-bg">
            Mogulate
          </div>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Center navigation for non-authenticated users */}
          {!user && !isLoading && (
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              <button
                onClick={() => {
                  const element = document.getElementById('why-entrepreneurs');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-charcoal hover:text-teal-600 font-medium transition-colors focus-ring rounded-lg px-2 py-1"
              >
                Features
              </button>
              <button
                onClick={scrollToPricing}
                className="text-charcoal hover:text-teal-600 font-medium transition-colors focus-ring rounded-lg px-2 py-1"
              >
                Pricing
              </button>
            </nav>
          )}
          
          {/* Auth buttons for non-authenticated users */}
          {!user && !isLoading && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/auth?mode=signin")}
                className="text-sm font-medium"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/auth?mode=signup")}
                className="text-sm font-medium gradient-bg border-none hover:opacity-90 button-transition"
              >
                Sign Up
              </Button>
            </div>
          )}
          
          {/* User dropdown for authenticated users */}
          {user && !isLoading && (
            <UserProfileDropdown />
          )}
          
          {/* Loading state */}
          {isLoading && (
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200 animate-pulse"></div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
