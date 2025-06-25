
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUsageData } from "@/hooks/useUsageData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Home, 
  History, 
  Settings, 
  CreditCard, 
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  onNewProject: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onNewProject }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { usageData } = useUsageData(user?.id);

  const navigationItems = [
    {
      icon: Home,
      label: "Home",
      path: "/dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      icon: History,
      label: "History",
      path: "/history",
      onClick: () => {}, // Placeholder for future implementation
      disabled: true,
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNewProject = () => {
    // Only show new project button on dashboard
    if (location.pathname === "/dashboard") {
      onNewProject();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="text-2xl font-bold bg-clip-text text-transparent gradient-bg">
          Mogulate
        </div>
      </div>

      {/* New Project Button - only show on dashboard */}
      {location.pathname === "/dashboard" && (
        <div className="p-4">
          <Button onClick={handleNewProject} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      )}

      {/* User Email */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="truncate">{user?.email}</span>
        </div>
      </div>

      <Separator className="mx-4" />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                location.pathname === item.path && "bg-gray-100",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={item.disabled ? undefined : item.onClick}
              disabled={item.disabled}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* Credits and Logout */}
      <div className="p-4 border-t">
        {/* Credits Remaining */}
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

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-gray-600 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
