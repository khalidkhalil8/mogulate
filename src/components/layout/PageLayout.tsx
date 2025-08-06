
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, showSidebar = true }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Don't show sidebar during setup flow or on specific pages
  const setupFlowPaths = ['/competitors', '/market-gaps', '/features', '/validation-plan', '/summary'];
  const noSidebarPaths = ['/auth', '/'];
  
  const shouldShowSidebar = user && showSidebar && 
    !setupFlowPaths.includes(location.pathname) && 
    !noSidebarPaths.includes(location.pathname);

  const handleNewProject = () => {
    // This will be handled by the DashboardSidebar component
  };

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar onNewProject={handleNewProject} />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
