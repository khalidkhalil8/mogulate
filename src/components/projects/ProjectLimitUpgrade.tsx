
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";

interface ProjectLimitUpgradeProps {
  currentTier: string;
  projectLimit: number;
  currentProjectCount: number;
}

const ProjectLimitUpgrade: React.FC<ProjectLimitUpgradeProps> = ({
  currentTier,
  projectLimit,
  currentProjectCount,
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Crown className="h-5 w-5" />
          Project Limit Reached
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700">
          <p className="mb-2">
            You've reached your project limit ({currentProjectCount}/{projectLimit === Infinity ? '∞' : projectLimit}) 
            for the <span className="font-semibold capitalize">{currentTier}</span> plan.
          </p>
          <p>
            Upgrade to create more projects and unlock additional features.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleUpgrade} className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Upgrade Plan
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="text-orange-700 border-orange-200 hover:bg-orange-100"
          >
            Manage Existing Projects
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectLimitUpgrade;
