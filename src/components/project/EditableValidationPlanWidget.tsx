import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Target, Plus, Edit, Trash2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { useProjectValidationPlan } from '@/hooks/useProjectValidationPlan';
import ValidationStepEditDialog from './ValidationStepEditDialog';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import type { ValidationStep } from '@/lib/types';

interface EditableValidationPlanWidgetProps {
  projectId: string;
  onRerun?: () => void;
  isRerunning?: boolean;
}

const EditableValidationPlanWidget: React.FC<EditableValidationPlanWidgetProps> = ({
  projectId,
  onRerun,
  isRerunning = false
}) => {
  const { validationPlan, isLoading, updateValidationPlan } = useProjectValidationPlan(projectId);
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; step?: ValidationStep; index?: number }>({ isOpen: false });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; step?: ValidationStep; index?: number }>({ isOpen: false });
  const [expandedCompleted, setExpandedCompleted] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleStepCompletion = async (index: number) => {
    const updatedPlan = [...validationPlan];
    updatedPlan[index] = { ...updatedPlan[index], isDone: !updatedPlan[index].isDone };
    await updateValidationPlan(updatedPlan);
  };

  const handleSaveStep = async (stepData: ValidationStep | Omit<ValidationStep, 'isDone'>) => {
    let updatedPlan = [...validationPlan];
    
    if (editDialog.index !== undefined) {
      // Edit existing step
      updatedPlan[editDialog.index] = stepData as ValidationStep;
    } else {
      // Add new step
      const newStep = { ...stepData, isDone: false } as ValidationStep;
      updatedPlan.push(newStep);
    }
    
    const success = await updateValidationPlan(updatedPlan);
    return success;
  };

  const handleDeleteStep = async () => {
    if (deleteDialog.index === undefined) return;
    
    const updatedPlan = validationPlan.filter((_, i) => i !== deleteDialog.index);
    const success = await updateValidationPlan(updatedPlan);
    if (success) {
      setDeleteDialog({ isOpen: false });
    }
  };

  const pendingSteps = validationPlan.filter(step => !step.isDone);
  const completedSteps = validationPlan.filter(step => step.isDone);

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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Validation Plan ({validationPlan.length} steps)
            </CardTitle>
            <div className="flex gap-2">
              {onRerun && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRerun}
                  disabled={isRerunning}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Rerun
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialog({ isOpen: true })}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Step
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {validationPlan.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No validation steps yet. Click "Add Step" to create your first validation step.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Pending Steps */}
              {pendingSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pending Steps</h4>
                  <div className="space-y-3">
                    {pendingSteps.map((step, originalIndex) => {
                      const actualIndex = validationPlan.findIndex(s => s === step);
                      return (
                        <div key={actualIndex} className="border-l-4 border-blue-200 pl-4 py-2 bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={step.isDone}
                              onCheckedChange={() => toggleStepCompletion(actualIndex)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-blue-800">{step.title}</h5>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${getPriorityColor(step.priority)}`}>
                                    {step.priority}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditDialog({ isOpen: true, step, index: actualIndex })}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteDialog({ isOpen: true, step, index: actualIndex })}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
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
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed Steps */}
              {completedSteps.length > 0 && (
                <Collapsible open={expandedCompleted} onOpenChange={setExpandedCompleted}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <h4 className="font-medium text-gray-900">
                        Completed Steps ({completedSteps.length})
                      </h4>
                      {expandedCompleted ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    {completedSteps.map((step, originalIndex) => {
                      const actualIndex = validationPlan.findIndex(s => s === step);
                      return (
                        <div key={actualIndex} className="border-l-4 border-green-200 pl-4 py-2 bg-green-50 border border-green-200 rounded-lg p-3 opacity-75">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={step.isDone}
                              onCheckedChange={() => toggleStepCompletion(actualIndex)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-green-800 line-through">{step.title}</h5>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    Completed
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditDialog({ isOpen: true, step, index: actualIndex })}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteDialog({ isOpen: true, step, index: actualIndex })}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              {step.goal && (
                                <p className="text-sm text-green-700 mb-1">
                                  <span className="font-medium">Goal:</span> {step.goal}
                                </p>
                              )}
                              {step.method && (
                                <p className="text-sm text-green-600">
                                  <span className="font-medium">Method:</span> {step.method}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ValidationStepEditDialog
        isOpen={editDialog.isOpen}
        onOpenChange={(open) => setEditDialog({ isOpen: open })}
        onSave={handleSaveStep}
        step={editDialog.step}
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Validation Step"
        description={`Are you sure you want to delete "${deleteDialog.step?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteStep}
        onCancel={() => setDeleteDialog({ isOpen: false })}
        variant="destructive"
        confirmText="Delete"
      />
    </>
  );
};

export default EditableValidationPlanWidget;