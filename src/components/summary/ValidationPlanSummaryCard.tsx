import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValidationPlanSummaryCardProps {
  validationPlan: Array<{
    title: string;
    goal: string;
    method: string;
    priority: 'High' | 'Medium' | 'Low';
    isDone: boolean;
  }>;
}

const ValidationPlanSummaryCard: React.FC<ValidationPlanSummaryCardProps> = ({ validationPlan }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!validationPlan || validationPlan.length === 0) {
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validationPlan.map((step, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationPlanSummaryCard;