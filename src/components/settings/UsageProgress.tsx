
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface UsageProgressProps {
  usedCount: number;
  maxCount: number;
  showAlert?: boolean;
}

const UsageProgress: React.FC<UsageProgressProps> = ({ 
  usedCount,
  maxCount,
  showAlert = false
}) => {
  const exceededLimit = usedCount > maxCount;
  const percentUsed = Math.min(100, (usedCount / maxCount) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Usage</CardTitle>
        <CardDescription>Your usage for this billing cycle</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exceededLimit && showAlert && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Usage Exceeded</AlertTitle>
              <AlertDescription>
                Your current usage ({usedCount}) exceeds your plan limit ({maxCount}). 
                Please upgrade or reduce usage.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Uses Remaining</span>
            <span className="font-medium">
              {usedCount} / {maxCount}
            </span>
          </div>
          
          <Progress 
            value={percentUsed} 
            className={`h-2 ${exceededLimit ? 'bg-red-100' : ''}`}
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
