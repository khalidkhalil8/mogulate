
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const UserInfoCard = () => {
  const { user, userProfile } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your account details and subscription status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subscription Tier</span>
            <Badge variant="secondary" className="capitalize">
              {userProfile?.subscription_tier || 'free'} Plan
            </Badge>
          </div>
          {userProfile?.subscription_started_at && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subscription Started</span>
              <span className="font-medium">
                {new Date(userProfile.subscription_started_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
