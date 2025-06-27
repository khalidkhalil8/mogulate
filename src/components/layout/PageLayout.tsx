
import React from "react";
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
  
  // Don't show sidebar during setup flow or on specific pages
  const setupFlowPaths = ['/idea', '/competitors', '/market-gaps', '/features', '/validation-plan', '/summary'];
  const noSidebarPaths = ['/profile', '/pricing', '/auth', '/'];
  
  const shouldShowSidebar = user && showSidebar && 
    !setupFlowPaths.includes(location.pathname) && 
    !noSidebarPaths.includes(location.pathname) &&
    !location.pathname.startsWith('/project/') === false; // Show on project pages

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
