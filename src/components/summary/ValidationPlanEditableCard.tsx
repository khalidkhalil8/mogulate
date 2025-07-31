import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface ValidationStep {
  title: string;
  goal: string;
  method: string;
  priority: 'High' | 'Medium' | 'Low';
  isDone: boolean;
}

interface ValidationPlanEditableCardProps {
  validationPlan: ValidationStep[];
  onSelectionChange: (selectedSteps: ValidationStep[]) => void;
  initialSelectedSteps?: ValidationStep[];
}

const ValidationPlanEditableCard: React.FC<ValidationPlanEditableCardProps> = ({ 
  validationPlan, 
  onSelectionChange,
  initialSelectedSteps = validationPlan 
}) => {
  const [selectedSteps, setSelectedSteps] = useState<Set<number>>(
    new Set(initialSelectedSteps.map((_, index) => 
      validationPlan.findIndex(step => 
        step.title === initialSelectedSteps.find(s => s.title === step.title)?.title
      )
    ).filter(index => index !== -1))
  );

  const handleStepToggle = (stepIndex: number) => {
    const newSelection = new Set(selectedSteps);
    if (newSelection.has(stepIndex)) {
      newSelection.delete(stepIndex);
    } else {
      newSelection.add(stepIndex);
    }
    setSelectedSteps(newSelection);
    
    // Send back only selected steps
    const selectedStepsList = validationPlan.filter((_, index) => newSelection.has(index));
    onSelectionChange(selectedStepsList);
  };

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
        <CardTitle className="text-xl flex items-center justify-between">
          Validation Plan ({selectedSteps.size} of {validSteps.length} selected)
          <Badge variant="outline" className="text-sm">
            Select steps to include in your plan
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validSteps.map((step, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4 py-3 bg-white rounded-r-md">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedSteps.has(index)}
                  onCheckedChange={() => handleStepToggle(index)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800">{step.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(step.priority)}`}>
                      {step.priority}
                    </span>
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
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Select the validation steps you want to include in your final plan. You can always modify or add steps later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationPlanEditableCard;