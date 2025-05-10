
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

interface AISuggestionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateAnalysis: () => void;
}

const AISuggestionDialog: React.FC<AISuggestionDialogProps> = ({
  isOpen,
  onOpenChange,
  onGenerateAnalysis,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Market Gaps</DialogTitle>
          <DialogDescription>
            Our AI will analyze your idea and competitors to suggest potential differentiation strategies.
            <p className="mt-2 text-amber-600">
              Note: Free tier accounts are limited to 5 AI analyses per month.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onGenerateAnalysis}>
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISuggestionDialog;
