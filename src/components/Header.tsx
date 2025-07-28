
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
          {/* Only show navigation for signed-out users */}
          {!user && !isLoading && (
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              <button
                onClick={scrollToPricing}
                className="text-charcoal hover:text-teal-600 font-medium transition-colors focus-ring rounded-lg px-2 py-1"
              >
                Pricing
              </button>
            </nav>
          )}
          
          {/* Give Feedback button - always visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFeedback}
            className="flex items-center gap-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-xs md:text-sm px-2 md:px-3"
          >
            <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Give Feedback</span>
            <span className="sm:hidden">Feedback</span>
          </Button>
          
          {isLoading ? (
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            <UserProfileDropdown />
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-xs md:text-sm px-3 md:px-4"
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
