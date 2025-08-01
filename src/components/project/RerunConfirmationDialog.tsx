import React, { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from 'lucide-react';

interface RerunConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (editedInput?: string) => void;
  title: string;
  description: string;
  analysisType: string;
  currentInput?: string;
  allowInputEdit?: boolean;
  isLoading?: boolean;
}

const RerunConfirmationDialog: React.FC<RerunConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  analysisType,
  currentInput = '',
  allowInputEdit = false,
  isLoading = false,
}) => {
  const [editedInput, setEditedInput] = useState(currentInput);

  const handleConfirm = () => {
    onConfirm(allowInputEdit ? editedInput : undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {title}
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p className="text-base">{description}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Warning:</strong> This will replace your existing {analysisType} data and consume 1 credit.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {allowInputEdit && (
          <div className="space-y-3">
            <Label htmlFor="input-edit" className="text-sm font-medium">
              Edit input before rerunning (optional):
            </Label>
            <Textarea
              id="input-edit"
              value={editedInput}
              onChange={(e) => setEditedInput(e.target.value)}
              placeholder="Enter your updated input..."
              rows={4}
              className="resize-none"
            />
          </div>
        )}

        <DialogFooter className="flex gap-3">
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
            {isLoading ? 'Running Analysis...' : 'Continue & Use Credit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RerunConfirmationDialog;