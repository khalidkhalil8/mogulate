
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from 'lucide-react';

interface IdeaSummaryCardProps {
  idea: string;
  isLocked?: boolean;
}

const IdeaSummaryCard: React.FC<IdeaSummaryCardProps> = ({ idea, isLocked = true }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Core Idea
          {isLocked && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This idea is locked to maintain project consistency</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{idea}</p>
        {isLocked && (
          <p className="text-xs text-gray-500 mt-2">
            This core idea is protected to maintain project consistency across all components.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default IdeaSummaryCard;
