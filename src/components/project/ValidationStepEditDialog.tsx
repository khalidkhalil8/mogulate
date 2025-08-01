import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ValidationStep } from '@/lib/types';

interface ValidationStepEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: ValidationStep | Omit<ValidationStep, 'isDone'>) => Promise<boolean>;
  step?: ValidationStep;
  isLoading?: boolean;
}

const ValidationStepEditDialog: React.FC<ValidationStepEditDialogProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  step,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    method: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  useEffect(() => {
    if (step) {
      setFormData({
        title: step.title,
        goal: step.goal,
        method: step.method,
        priority: step.priority
      });
    } else {
      setFormData({
        title: '',
        goal: '',
        method: '',
        priority: 'Medium'
      });
    }
  }, [step, isOpen]);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    const stepData = step 
      ? { ...step, ...formData }
      : { ...formData, isDone: false };

    const success = await onSave(stepData);
    if (success) {
      onOpenChange(false);
    }
  };

  const canSave = formData.title.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step ? 'Edit Validation Step' : 'Add New Validation Step'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Step Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter validation step title..."
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="goal">Goal/Description</Label>
            <Textarea
              id="goal"
              value={formData.goal}
              onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
              placeholder="What do you want to achieve with this validation step?"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="method">Method/Tool</Label>
            <Textarea
              id="method"
              value={formData.method}
              onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
              placeholder="How will you validate this? What tools will you use?"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'Low' | 'Medium' | 'High') => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || isLoading}
            className="gradient-bg border-none hover:opacity-90 button-transition"
          >
            {isLoading ? 'Saving...' : 'Save Step'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidationStepEditDialog;