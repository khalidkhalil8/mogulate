
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ProjectCredits } from '@/hooks/useProjectCredits';

interface CreditConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  projectCredits: ProjectCredits;
  actionName: string;
  isLoading?: boolean;
}

const CreditConfirmationDialog: React.FC<CreditConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  projectCredits,
  actionName,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { creditsRemaining, creditsLimit, tier } = projectCredits;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleUpgrade = () => {
    navigate('/pricing');
    onOpenChange(false);
  };

  // If no credits remaining, show upgrade dialog
  if (creditsRemaining === 0 && creditsLimit !== Infinity) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No Credits Remaining</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                You've used all {creditsLimit} credits for this project on your {tier} plan.
              </p>
              <p>
                Upgrade to continue using AI features for market analysis, competitor research, and more.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade}
              className="gradient-bg border-none hover:opacity-90"
            >
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Use Credit for {actionName}</DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              This will use 1 credit from your project allowance.
            </p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">
                <strong>Credits remaining:</strong> {creditsLimit === Infinity ? 'Unlimited' : creditsRemaining}
              </p>
              <p className="text-sm">
                <strong>Plan:</strong> {tier} plan
              </p>
            </div>
            {creditsRemaining <= 2 && creditsLimit !== Infinity && (
              <p className="text-sm text-yellow-600">
                <strong>Low credits:</strong> Consider upgrading to avoid interruptions.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="gradient-bg border-none hover:opacity-90"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditConfirmationDialog;
