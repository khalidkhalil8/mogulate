
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ProjectCredits } from '@/hooks/useProjectCredits';

interface ProjectCreditsDisplayProps {
  projectCredits: ProjectCredits;
  showUpgradeButton?: boolean;
}

const ProjectCreditsDisplay: React.FC<ProjectCreditsDisplayProps> = ({
  projectCredits,
  showUpgradeButton = true,
}) => {
  const navigate = useNavigate();
  const { creditsUsed, creditsRemaining, creditsLimit, tier } = projectCredits;

  const getCreditsColor = () => {
    if (creditsLimit === Infinity) return 'bg-green-500';
    if (creditsRemaining === 0) return 'bg-red-500';
    if (creditsRemaining <= 2) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getCreditsText = () => {
    if (creditsLimit === Infinity) return 'Unlimited';
    return `${creditsUsed}/${creditsLimit}`;
  };

  const isLowCredits = creditsLimit !== Infinity && creditsRemaining <= 2;
  const isOutOfCredits = creditsLimit !== Infinity && creditsRemaining === 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Project Credits</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {tier} Plan
          </Badge>
        </div>
        <CardDescription>
          Credits used for AI actions in this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Credits Used</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getCreditsColor()}`} />
              <span className="font-mono text-sm">{getCreditsText()}</span>
            </div>
          </div>

          {creditsLimit !== Infinity && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getCreditsColor()}`}
                style={{ width: `${Math.min(100, (creditsUsed / creditsLimit) * 100)}%` }}
              />
            </div>
          )}

          {isOutOfCredits && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <p className="font-medium">No credits remaining</p>
              <p>You've used all credits for this project. Upgrade to continue using AI features.</p>
            </div>
          )}

          {isLowCredits && !isOutOfCredits && (
            <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
              <p className="font-medium">Low credits remaining</p>
              <p>Only {creditsRemaining} credits left. Consider upgrading to avoid interruptions.</p>
            </div>
          )}

          {(isLowCredits || isOutOfCredits) && showUpgradeButton && tier !== 'pro' && (
            <Button 
              onClick={() => navigate('/pricing')}
              className="w-full gradient-bg border-none hover:opacity-90"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCreditsDisplay;
