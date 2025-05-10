
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface SubscriptionDetailsProps {
  subscriptionTier: string;
  nextResetDate: string | undefined;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ 
  subscriptionTier,
  nextResetDate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Overview</CardTitle>
        <CardDescription>Your current subscription details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Plan</span>
            <span className="font-medium capitalize">{subscriptionTier} Plan</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Next Reset Date</span>
            <span className="font-medium">{nextResetDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetails;
