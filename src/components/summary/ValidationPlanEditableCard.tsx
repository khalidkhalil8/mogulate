import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ValidationStep } from '@/lib/types';

interface ValidationPlanEditableCardProps {
  validationPlan: ValidationStep[];
  selectedSteps: string[];
  onStepToggle: (stepIndex: number) => void;
}

const ValidationPlanEditableCard: React.FC<ValidationPlanEditableCardProps> = ({ 
  validationPlan, 
  selectedSteps, 
  onStepToggle 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Ensure validationPlan is an array and has content
  const validSteps = Array.isArray(validationPlan) ? validationPlan : [];

  if (validSteps.length === 0) {
    return (
      <Card className="bg-blue-50 border-blue-100">
        <CardHeader>
          <CardTitle className="text-xl">Validation Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No validation plan created yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-100">
      <CardHeader>
        <CardTitle className="text-xl">Validation Plan</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Select the validation steps you want to include in your project plan
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validSteps.map((step, index) => (
            <div key={index} className="border border-blue-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedSteps.includes(index.toString())}
                  onCheckedChange={() => onStepToggle(index)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800">{step.title}</h4>
                    <Badge className={`text-xs ${getPriorityColor(step.priority)}`}>
                      {step.priority}
                    </Badge>
                  </div>
                  {step.goal && (
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Goal:</span> {step.goal}
                    </p>
                  )}
                  {step.method && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Method:</span> {step.method}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedSteps.length > 0 && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              {selectedSteps.length} of {validSteps.length} validation steps selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationPlanEditableCard;