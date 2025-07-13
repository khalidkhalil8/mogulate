
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValidationPlanSummaryCardProps {
  validationPlan: string;
}

const ValidationPlanSummaryCard: React.FC<ValidationPlanSummaryCardProps> = ({ validationPlan }) => {
  // Parse the validation plan into steps for cleaner display
  const parseSteps = (planText: string) => {
    if (!planText) return [];
    
    const steps = [];
    const stepSections = planText.split(/Step \d+:/);
    
    stepSections.forEach((section, index) => {
      if (index === 0 || !section.trim()) return;
      
      const lines = section.trim().split('\n').filter(line => line.trim());
      let title = '';
      let description = '';
      let method = '';
      let priority = 'Medium';
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!title && trimmedLine) {
          title = trimmedLine;
        } else if (trimmedLine.startsWith('Goal/Description:')) {
          description = trimmedLine.replace('Goal/Description:', '').trim();
        } else if (trimmedLine.startsWith('Tool/Method:')) {
          method = trimmedLine.replace('Tool/Method:', '').trim();
        } else if (trimmedLine.startsWith('Priority:')) {
          priority = trimmedLine.replace('Priority:', '').trim();
        }
      });
      
      if (title) {
        steps.push({ title, description, method, priority });
      }
    });
    
    return steps;
  };

  const steps = parseSteps(validationPlan);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {steps.length > 0 ? (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                <h4 className="font-medium text-gray-900 mb-2">{step.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {step.description && <p><span className="font-medium">Goal:</span> {step.description}</p>}
                  {step.method && <p><span className="font-medium">Method:</span> {step.method}</p>}
                  <p>
                    <span className="font-medium">Priority:</span>{' '}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      step.priority === 'High' ? 'bg-red-100 text-red-800' :
                      step.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {step.priority}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No validation plan created yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationPlanSummaryCard;
