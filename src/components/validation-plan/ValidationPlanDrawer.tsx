
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ValidationStep } from '@/hooks/useValidationSteps';

interface ValidationPlanDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: Omit<ValidationStep, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onUpdate: (id: string, step: Partial<ValidationStep>) => Promise<boolean>;
  editingStep?: ValidationStep | null;
  projectId: string;
}

const ValidationPlanDrawer: React.FC<ValidationPlanDrawerProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  onUpdate,
  editingStep = null,
  projectId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  useEffect(() => {
    if (isOpen) {
      if (editingStep) {
        setTitle(editingStep.title);
        setDescription(editingStep.description || '');
        setMethod(editingStep.method || '');
        setPriority(editingStep.priority);
      } else {
        setTitle('');
        setDescription('');
        setMethod('');
        setPriority('Medium');
      }
    }
  }, [editingStep, isOpen]);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    const stepData = {
      project_id: projectId,
      title: title.trim(),
      description: description.trim() || null,
      method: method.trim() || null,
      priority,
      is_completed: false,
    };

    let success = false;
    if (editingStep) {
      success = await onUpdate(editingStep.id, stepData);
    } else {
      success = await onSave(stepData);
    }

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[720px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingStep ? 'Edit Validation Step' : 'Add New Validation Step'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="stepTitle">Step Title *</Label>
            <Input
              id="stepTitle"
              placeholder="e.g., Create Landing Page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepDescription">Goal or Description</Label>
            <Textarea
              id="stepDescription"
              placeholder="What do you want to achieve with this step?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepMethod">Tool or Method</Label>
            <Input
              id="stepMethod"
              placeholder="e.g., Google Forms, Webflow, User interviews"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepPriority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as 'High' | 'Medium' | 'Low')}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {editingStep ? 'Update Step' : 'Add Step'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ValidationPlanDrawer;
