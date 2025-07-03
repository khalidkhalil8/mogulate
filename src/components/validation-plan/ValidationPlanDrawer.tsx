
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface ValidationStep {
  id: string;
  title: string;
  description: string;
  tool: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface ValidationPlanDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: string) => Promise<boolean>;
  validationPlan?: string;
  editingStep?: ValidationStep | null;
  isEditing?: boolean;
}

const ValidationPlanDrawer: React.FC<ValidationPlanDrawerProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  validationPlan = '',
  editingStep = null,
  isEditing = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tool, setTool] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  useEffect(() => {
    if (isOpen) {
      if (editingStep) {
        setTitle(editingStep.title);
        setDescription(editingStep.description);
        setTool(editingStep.tool);
        setPriority(editingStep.priority);
      } else {
        setTitle('');
        setDescription('');
        setTool('');
        setPriority('Medium');
      }
    }
  }, [editingStep, isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !tool.trim()) {
      return;
    }

    // Parse existing validation plan
    const existingSteps: ValidationStep[] = [];
    if (validationPlan) {
      try {
        const stepBlocks = validationPlan.split('\n\n').filter(block => block.trim());
        stepBlocks.forEach((block, index) => {
          const lines = block.split('\n');
          const titleLine = lines.find(line => line.startsWith('Step '));
          const descLine = lines.find(line => line.startsWith('Goal/Description: '));
          const toolLine = lines.find(line => line.startsWith('Tool/Method: '));
          const priorityLine = lines.find(line => line.startsWith('Priority: '));
          
          if (titleLine) {
            const stepTitle = titleLine.replace(/^Step \d+: /, '');
            const stepDescription = descLine ? descLine.replace('Goal/Description: ', '') : '';
            const stepTool = toolLine ? toolLine.replace('Tool/Method: ', '') : '';
            const stepPriority = priorityLine ? priorityLine.replace('Priority: ', '') as 'High' | 'Medium' | 'Low' : 'Medium';
            
            existingSteps.push({
              id: (index + 1).toString(),
              title: stepTitle,
              description: stepDescription,
              tool: stepTool,
              priority: stepPriority
            });
          }
        });
      } catch (error) {
        console.error('Error parsing validation plan:', error);
      }
    }

    // Add or update step
    let updatedSteps: ValidationStep[];
    if (editingStep) {
      // Update existing step
      updatedSteps = existingSteps.map(step => 
        step.id === editingStep.id 
          ? { ...step, title, description, tool, priority }
          : step
      );
    } else {
      // Add new step
      const newStep: ValidationStep = {
        id: Date.now().toString(),
        title,
        description,
        tool,
        priority
      };
      updatedSteps = [...existingSteps, newStep];
    }

    // Convert back to string format
    const updatedPlan = updatedSteps.map((step, index) => 
      `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.description}\nTool/Method: ${step.tool}\nPriority: ${step.priority}`
    ).join('\n\n');

    const success = await onSave(updatedPlan);
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
            <Label htmlFor="stepDescription">Goal or Description *</Label>
            <Textarea
              id="stepDescription"
              placeholder="What do you want to achieve with this step?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepTool">Tool or Method *</Label>
            <Input
              id="stepTool"
              placeholder="e.g., Google Forms, Webflow, User interviews"
              value={tool}
              onChange={(e) => setTool(e.target.value)}
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
            <Button onClick={handleSave} disabled={!title.trim() || !description.trim() || !tool.trim()}>
              {editingStep ? 'Update Step' : 'Add Step'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ValidationPlanDrawer;
