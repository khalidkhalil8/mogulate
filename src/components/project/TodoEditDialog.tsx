import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Todo } from '@/hooks/useProjectTodos';

interface TodoEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => Promise<boolean>;
  todo?: Todo;
  isLoading?: boolean;
}

const TodoEditDialog: React.FC<TodoEditDialogProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  todo,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
    } else {
      setTitle('');
    }
  }, [todo, isOpen]);

  const handleSave = async () => {
    if (!title.trim()) return;

    const success = await onSave(title.trim());
    if (success) {
      onOpenChange(false);
      setTitle('');
    }
  };

  const canSave = title.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {todo ? 'Edit Todo' : 'Add New Todo'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Todo Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter todo title..."
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSave) {
                  handleSave();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || isLoading}
            className="gradient-bg border-none hover:opacity-90 button-transition"
          >
            {isLoading ? 'Saving...' : 'Save Todo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TodoEditDialog;