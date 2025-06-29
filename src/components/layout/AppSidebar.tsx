
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUsageData } from "@/hooks/useUsageData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-2xl font-bold bg-clip-text text-transparent gradient-bg">
            Mogulate
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Project Button */}
      {!isCollapsed && (
        <div className="p-4">
          <Button onClick={handleNewProject} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      )}

      {isCollapsed && (
        <div className="p-2">
          <Button onClick={handleNewProject} size="sm" className="w-full p-2">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* User Email */}
      {!isCollapsed && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span className="truncate">{user?.email}</span>
          </div>
        </div>
      )}

      <Separator className="mx-4" />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full gap-2 ${isCollapsed ? 'px-2 justify-center' : 'justify-start'} ${
                isActive(item.path) ? "bg-gray-100" : ""
              }`}
              onClick={item.onClick}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && item.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* Credits and Logout */}
      <div className="p-4 border-t">
        {/* Credits Remaining */}
        {!isCollapsed && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Credits Remaining
            </div>
            <div className="text-lg font-semibold">
              {usageData ? `${Math.max(0, usageData.limit - usageData.used)}` : '...'} 
              <span className="text-sm font-normal text-gray-500">
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
          className={`w-full gap-2 text-gray-600 hover:text-red-600 ${isCollapsed ? 'px-2 justify-center' : 'justify-start'}`}
          title={isCollapsed ? "Log Out" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && "Log Out"}
        </Button>
      </div>
    </div>
  );
};

export default AppSidebar;
