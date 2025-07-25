
import React from 'react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

interface IdeaChangeWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentIdea: string;
  newIdea: string;
}

const IdeaChangeWarningDialog: React.FC<IdeaChangeWarningDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentIdea,
  newIdea,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title="Warning: Changing Core Idea"
      description={`You are about to change your project's core idea from "${currentIdea}" to "${newIdea}". This action cannot be undone and may affect your entire project strategy. Are you sure you want to proceed?`}
      confirmText="Yes, Change Idea"
      cancelText="Keep Current Idea"
      onConfirm={onConfirm}
      onCancel={onClose}
      variant="destructive"
    />
  );
};

export default IdeaChangeWarningDialog;
