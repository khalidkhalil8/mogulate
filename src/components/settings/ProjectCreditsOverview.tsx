
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import { useProjectLimits } from "@/hooks/useProjectLimits";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ProjectCreditsOverview = () => {
  const { userProfile } = useAuth();
  const { projects, isLoading } = useProjects();
  const { currentTier } = useProjectLimits();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Credits</CardTitle>
          <CardDescription>Your credit usage across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCreditsLimit = (tier: string) => {
    switch (tier) {
      case 'free':
        return 4;
      case 'starter':
        return 10;
      case 'pro':
        return Infinity;
      default:
        return 4;
    }
  };

  const creditsLimit = getCreditsLimit(currentTier);
  const totalCreditsUsed = projects.reduce((sum, project) => sum + (project.credits_used || 0), 0);
  const totalCreditsRemaining = creditsLimit === Infinity ? Infinity : Math.max(0, creditsLimit - totalCreditsUsed);

  const getProgressPercentage = () => {
    if (creditsLimit === Infinity) return 0;
    return Math.min(100, (totalCreditsUsed / creditsLimit) * 100);
  };

  const getStatusColor = () => {
    if (creditsLimit === Infinity) return 'bg-green-500';
    if (totalCreditsRemaining === 0) return 'bg-red-500';
    if (totalCreditsRemaining <= 2) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Credits</CardTitle>
        <CardDescription>Your credit usage across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Credit Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Credits</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className="font-mono text-sm">
                  {creditsLimit === Infinity ? `${totalCreditsUsed} / Unlimited` : `${totalCreditsUsed} / ${creditsLimit}`}
                </span>
              </div>
            </div>

            {creditsLimit !== Infinity && (
              <Progress value={getProgressPercentage()} className="h-2" />
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Credits Used</span>
                <p className="font-medium">{totalCreditsUsed}</p>
              </div>
              <div>
                <span className="text-gray-600">Credits Remaining</span>
                <p className="font-medium">
                  {creditsLimit === Infinity ? 'Unlimited' : totalCreditsRemaining}
                </p>
              </div>
            </div>
          </div>

          {/* Per-Project Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Per-Project Usage</h4>
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{project.title}</p>
                    <p className="text-xs text-gray-600">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {project.credits_used || 0} credits used
                    </Badge>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No projects yet. Create your first project to start using credits.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCreditsOverview;
