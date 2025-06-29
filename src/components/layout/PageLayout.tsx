
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, showSidebar = true }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64px for collapsed, 256px for expanded
  
  // Don't show sidebar during setup flow or on specific pages
  const setupFlowPaths = ['/idea', '/competitors', '/market-gaps', '/features', '/validation-plan', '/summary'];
  const noSidebarPaths = ['/profile', '/pricing', '/auth', '/'];
  
  const shouldShowSidebar = user && showSidebar && 
    !setupFlowPaths.includes(location.pathname) && 
    !noSidebarPaths.includes(location.pathname);

  // Listen for sidebar width changes
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      setSidebarWidth(collapsed ? 64 : 256);
    };

    // Check initial state
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 transition-all duration-300" style={{ marginLeft: `${sidebarWidth}px` }}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
