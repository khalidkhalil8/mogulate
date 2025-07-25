
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useProjects } from '@/hooks/useProjects';
import IdeaChangeWarningDialog from './IdeaChangeWarningDialog';
import type { Project } from '@/hooks/useProjects';

interface ProjectEditDialogProps {
  project: Project;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectEditDialog: React.FC<ProjectEditDialogProps> = ({
  project,
  isOpen,
  onOpenChange,
}) => {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.idea || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showIdeaWarning, setShowIdeaWarning] = useState(false);
  const { updateProject } = useProjects();

  const hasExistingIdea = project.idea && project.idea.trim().length > 0;
  const ideaHasChanged = description.trim() !== (project.idea || '').trim();

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Project name is required');
      return;
    }

    // If there's an existing idea and it's being changed, show warning
    if (hasExistingIdea && ideaHasChanged && description.trim().length > 0) {
      setShowIdeaWarning(true);
      return;
    }

    await performUpdate();
  };

  const performUpdate = async () => {
    setIsLoading(true);
    try {
      await updateProject(project.id, {
        title: title.trim(),
        idea: description.trim(),
      });
      onOpenChange(false);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setIsLoading(false);
      setShowIdeaWarning(false);
    }
  };

  const handleIdeaChangeConfirm = () => {
    performUpdate();
  };

  const handleIdeaChangeCancel = () => {
    setShowIdeaWarning(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">
                Core Idea
                {hasExistingIdea && (
                  <span className="text-sm text-amber-600 ml-2">
                    (Warning: Changing this will affect your entire project)
                  </span>
                )}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your project's core idea"
                className="min-h-[100px]"
              />
              {hasExistingIdea && ideaHasChanged && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ You are modifying the core idea of this project. This may impact your competitors, features, and validation plan.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <IdeaChangeWarningDialog
        isOpen={showIdeaWarning}
        onClose={handleIdeaChangeCancel}
        onConfirm={handleIdeaChangeConfirm}
        currentIdea={project.idea || ''}
        newIdea={description}
      />
    </>
  );
};

export default ProjectEditDialog;
