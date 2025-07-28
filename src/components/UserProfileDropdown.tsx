
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const UserProfileDropdown: React.FC = () => {
  const { user, logout, userProfile, refreshUserProfile } = useAuth();
  
  if (!user) {
    return null;
  }
  
  const userInitial = user.email ? user.email[0].toUpperCase() : "U";
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback className="bg-teal-100 text-teal-800">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.email}</span>
            {userProfile && (
              <Badge variant="outline" className="mt-1 capitalize">
                {userProfile.subscription_tier} Plan
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="w-full cursor-pointer">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/pricing" className="w-full cursor-pointer">
            Pricing Plans
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => logout()}
          className="text-red-600 cursor-pointer"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
