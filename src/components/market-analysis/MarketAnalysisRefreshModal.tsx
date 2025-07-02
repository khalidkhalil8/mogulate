
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

interface MarketAnalysisRefreshModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const MarketAnalysisRefreshModal: React.FC<MarketAnalysisRefreshModalProps> = ({
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
          <DialogTitle>Refresh Market Analysis</DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Re-running the market analysis will generate new market gaps and positioning suggestions based on your latest idea description and competitors list.
            </p>
            <p className="text-sm text-gray-500">
              Use this if you've changed your idea or added competitors.
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
            {isLoading ? 'Running Analysis...' : 'Run New Analysis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarketAnalysisRefreshModal;
