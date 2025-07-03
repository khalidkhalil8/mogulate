
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ValidationPlanRegenerateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const ValidationPlanRegenerateModal: React.FC<ValidationPlanRegenerateModalProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Use AI to Suggest a Validation Plan</DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              This will generate 3–5 steps to validate your idea, including tools and success signals based on your current project data.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="gradient-bg border-none hover:opacity-90 button-transition"
          >
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidationPlanRegenerateModal;
