
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Edit, ChevronDown, ChevronRight } from 'lucide-react';
import type { ValidationStep } from '@/lib/types';

interface ValidationStepCardProps {
  step: ValidationStep & { id?: string };
  onEdit?: (step: ValidationStep & { id?: string }) => void;
  onToggleCompletion?: (isDone: boolean) => void;
  showActions?: boolean;
}

const ValidationStepCard: React.FC<ValidationStepCardProps> = ({
  step,
  onEdit,
  onToggleCompletion,
  showActions = true
}) => {
  const [isExpanded, setIsExpanded] = useState(!step.isDone);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleCompletion = (checked: boolean) => {
    if (onToggleCompletion) {
      onToggleCompletion(checked);
    }
    if (checked) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <Card className={`transition-all duration-200 ${step.isDone ? 'opacity-75 bg-gray-50' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {onToggleCompletion && (
              <Checkbox
                checked={step.isDone}
                onCheckedChange={handleToggleCompletion}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-lg font-bold ${step.isDone ? 'line-through text-gray-500' : ''}`}>
                  {step.title}
                </h3>
                <Badge className={getPriorityColor(step.priority)}>
                  {step.priority}
                </Badge>
              </div>
              
              {step.isDone && (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-500 hover:text-gray-700">
                      {isExpanded ? (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Hide details
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4 mr-1" />
                          Show details
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="space-y-3">
                      {step.goal && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Goal/Description:</p>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {step.goal}
                          </p>
                        </div>
                      )}
                      {step.method && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Tool/Method:</p>
                          <p className="text-gray-600 text-sm">
                            {step.method}
                          </p>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
          
          {showActions && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(step)}
              className="h-8 w-8 p-0 ml-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      {!step.isDone && (
        <CardContent className="space-y-3">
          {step.goal && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Goal/Description:</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.goal}
              </p>
            </div>
          )}
          {step.method && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Tool/Method:</p>
              <p className="text-gray-600 text-sm">
                {step.method}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ValidationStepCard;
