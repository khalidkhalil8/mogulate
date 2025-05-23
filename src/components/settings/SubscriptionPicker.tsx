
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SubscriptionPickerProps {
  currentTier: string;
  isUpdating?: boolean;
  userId?: string;
  onChangeSubscription: (tier: string) => void;
}

const SubscriptionPicker: React.FC<SubscriptionPickerProps> = ({
  currentTier,
  isUpdating = false,
  userId,
  onChangeSubscription
}) => {
  // Normalize tier to lowercase to ensure consistent comparison
  const normalizedTier = currentTier.toLowerCase();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Subscription</CardTitle>
        <CardDescription>Upgrade or change your current plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {normalizedTier !== "free" && (
            <div className="flex justify-between items-center p-4 border rounded-md">
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-sm text-gray-500">5 uses per month</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => onChangeSubscription("free")}
                disabled={isUpdating || normalizedTier === "free"}
              >
                Switch to Free
              </Button>
            </div>
          )}
          
          {normalizedTier !== "starter" && (
            <div className="flex justify-between items-center p-4 border rounded-md bg-gray-50">
              <div>
                <p className="font-medium">Starter Plan</p>
                <p className="text-sm text-gray-500">20 uses per month</p>
              </div>
              <Button 
                onClick={() => onChangeSubscription("starter")}
                disabled={isUpdating || normalizedTier === "starter"}
              >
                {normalizedTier === "pro" ? "Switch to Starter" : "Upgrade to Starter"}
              </Button>
            </div>
          )}
          
          {normalizedTier !== "pro" && (
            <div className="flex justify-between items-center p-4 border rounded-md bg-blue-50">
              <div>
                <p className="font-medium">Pro Plan</p>
                <p className="text-sm text-gray-500">100 uses per month</p>
              </div>
              <Button 
                onClick={() => onChangeSubscription("pro")}
                disabled={isUpdating || normalizedTier === "pro"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Changing your subscription will reset your billing cycle.
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPicker;
