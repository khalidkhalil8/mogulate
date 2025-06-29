
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface ValidationPlanDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: string) => Promise<boolean>;
  validationPlan?: string;
}

const ValidationPlanDrawer: React.FC<ValidationPlanDrawerProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  validationPlan = '',
}) => {
  const [plan, setPlan] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPlan(validationPlan);
    }
  }, [validationPlan, isOpen]);

  const handleSave = async () => {
    const success = await onSave(plan);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[720px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Validation Plan</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="validationPlan">Validation Plan</Label>
            <Textarea
              id="validationPlan"
              placeholder="Describe your validation steps, experiments, and metrics to validate your business idea..."
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="min-h-[300px]"
            />
            <p className="text-sm text-gray-500">
              Include specific steps like creating landing pages, conducting surveys, building MVPs, or running paid ads to test demand.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ValidationPlanDrawer;
