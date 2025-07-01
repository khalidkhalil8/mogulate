
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

interface FindCompetitorsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFindCompetitors: () => void;
}

const FindCompetitorsDialog: React.FC<FindCompetitorsDialogProps> = ({
  isOpen,
  onOpenChange,
  onFindCompetitors
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finding Competition</DialogTitle>
          <DialogDescription>
            Our AI will analyze your idea and find competition in your market. 
            Understanding existing solutions helps you identify gaps and opportunities 
            for your product.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onFindCompetitors}>
            Let AI Suggest Competitors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FindCompetitorsDialog;
