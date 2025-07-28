
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUsageData } from "@/hooks/useUsageData";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Home, 
  Settings, 
  CreditCard, 
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { usageData } = useUsageData(user?.id);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
    // Trigger storage event for PageLayout to listen
    window.dispatchEvent(new Event('storage'));
  }, [isCollapsed]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNewProject = () => {
    navigate("/idea");
  };

  const navigationItems = [
    {
      icon: Home,
      label: "Home",
      path: "/dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/profile",
      onClick: () => navigate("/profile"),
    },
    {
      icon: CreditCard,
      label: "Pricing",
      path: "/pricing",
      onClick: () => navigate("/pricing"),
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`fixed left-0 top-0 h-full bg-white flex flex-col transition-all duration-300 shadow-[2px_0_8px_0_rgba(0,0,0,0.1)] z-40 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo and Toggle */}
      <div className="p-3 md:p-4 border-b flex items-center justify-between min-h-[64px]">
        {!isCollapsed && (
          <div className="text-xl md:text-2xl font-bold bg-clip-text text-transparent gradient-bg">
            Mogulate
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 focus-ring"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Project Button */}
      <div className="p-3 md:p-4">
        {!isCollapsed ? (
          <Button 
            onClick={handleNewProject} 
            className="w-full gap-2 mobile-button gradient-bg border-none hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        ) : (
          <Button 
            onClick={handleNewProject} 
            size="sm" 
            className="w-full p-2 gradient-bg border-none hover:opacity-90"
            title="New Project"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* User Email */}
      {!isCollapsed && (
        <div className="px-3 md:px-4 py-2 border-b">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{user?.email}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full gap-2 mobile-button ${isCollapsed ? 'px-2 justify-center' : 'justify-start'} ${
                isActive(item.path) ? "bg-gray-100 text-primary" : "hover:bg-gray-50"
              }`}
              onClick={item.onClick}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Button>
          ))}
        </div>
      </nav>

      {/* Credits and Logout */}
      <div className="p-3 md:p-4 border-t">
        {/* Credits Remaining */}
        {!isCollapsed && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Credits Remaining
            </div>
            <div className="text-base md:text-lg font-semibold">
              {usageData ? `${Math.max(0, usageData.limit - usageData.used)}` : '...'} 
              <span className="text-xs md:text-sm font-normal text-gray-500">
                {usageData ? ` / ${usageData.limit}` : ''}
              </span>
            </div>
            {usageData && (
              <div className="text-xs text-gray-500 mt-1 capitalize">
                {usageData.tier} Plan
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 mobile-button ${isCollapsed ? 'px-2 justify-center' : 'justify-start'}`}
          title={isCollapsed ? "Log Out" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Log Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default AppSidebar;
