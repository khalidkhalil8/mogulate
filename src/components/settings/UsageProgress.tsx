
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UsageProgressProps {
  usedCount: number;
  maxCount: number;
}

const UsageProgress: React.FC<UsageProgressProps> = ({ 
  usedCount,
  maxCount
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Usage</CardTitle>
        <CardDescription>Your usage for this billing cycle</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Uses Remaining</span>
            <span className="font-medium">
              {usedCount} / {maxCount}
            </span>
          </div>
          
          <Progress 
            value={(usedCount / maxCount) * 100} 
            className="h-2"
          />
          
          <p className="text-sm text-gray-500">
            {maxCount > usedCount 
              ? `You have ${maxCount - usedCount} uses remaining this cycle.`
              : "You've used all your available uses for this cycle."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageProgress;
