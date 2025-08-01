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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Feature } from '@/lib/types';

interface FeatureEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (feature: Feature | Omit<Feature, 'id'>) => Promise<boolean>;
  feature?: Feature;
  isLoading?: boolean;
}

const FeatureEditDialog: React.FC<FeatureEditDialogProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  feature,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Planned' as 'Planned' | 'In Progress' | 'Done',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  useEffect(() => {
    if (feature) {
      setFormData({
        title: feature.title,
        description: feature.description,
        status: feature.status,
        priority: feature.priority
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Planned',
        priority: 'Medium'
      });
    }
  }, [feature, isOpen]);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    const featureData = feature 
      ? { ...feature, ...formData }
      : formData;

    const success = await onSave(featureData);
    if (success) {
      onOpenChange(false);
    }
  };

  const canSave = formData.title.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {feature ? 'Edit Feature' : 'Add New Feature'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Feature Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter feature title..."
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this feature..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'Low' | 'Medium' | 'High') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Planned' | 'In Progress' | 'Done') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            {isLoading ? 'Saving...' : 'Save Feature'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureEditDialog;