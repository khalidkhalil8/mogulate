
import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <header className="py-4 px-4 md:px-6 border-b shadow-sm">
      <div className="container-width flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="text-2xl font-bold bg-clip-text text-transparent gradient-bg">
            TalonIQ
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-charcoal hover:text-teal-600 font-medium transition-colors"
          >
            Home
          </Link>
        </nav>
        
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
    </header>
  );
};

export default Header;
