import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target } from 'lucide-react';
import { useProjectValidationPlan } from '@/hooks/useProjectValidationPlan';

interface EditableValidationPlanWidgetProps {
  projectId: string;
}

const EditableValidationPlanWidget: React.FC<EditableValidationPlanWidgetProps> = ({
  projectId
}) => {
  const navigate = useNavigate();
  const { validationPlan, isLoading } = useProjectValidationPlan(projectId);

  const pendingSteps = validationPlan.filter(step => !step.isDone);

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Validation Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Validation Plan ({validationPlan.length} steps)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationPlan.length === 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant="secondary">Not Started</Badge>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending:</span>
                  <Badge variant="outline">{pendingSteps.length}</Badge>
                </div>
                {pendingSteps.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {pendingSteps.length} pending step{pendingSteps.length !== 1 ? 's' : ''}
                  </p>
                )}
              </>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/project/${projectId}/validation-plan`)}
                className="flex-1"
              >
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </>
  );
};

export default EditableValidationPlanWidget;