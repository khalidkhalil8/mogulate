
import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Feature } from '@/lib/types';

interface FeatureDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (feature: Omit<Feature, 'id'>) => void;
  feature?: Feature;
}

const FeatureDrawer: React.FC<FeatureDrawerProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  feature,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Planned' | 'In Progress' | 'Done'>('Planned');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  useEffect(() => {
    if (feature) {
      setTitle(feature.title);
      setDescription(feature.description);
      setStatus(feature.status);
      setPriority(feature.priority);
    } else {
      setTitle('');
      setDescription('');
      setStatus('Planned');
      setPriority('Medium');
    }
  }, [feature, isOpen]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setStatus('Planned');
    setPriority('Medium');
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[720px]">
        <SheetHeader>
          <SheetTitle>
            {feature ? 'Edit Feature' : 'Add New Feature'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Feature Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter feature title (e.g., User Authentication, Dashboard)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature in detail, including functionality and user benefits..."
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as 'Planned' | 'In Progress' | 'Done')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as 'Low' | 'Medium' | 'High')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Feature Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• User Authentication & Registration</li>
                <li>• Dashboard with Analytics</li>
                <li>• Real-time Notifications</li>
                <li>• File Upload & Management</li>
                <li>• Payment Integration</li>
                <li>• Search & Filtering</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex-1"
              >
                {feature ? 'Update Feature' : 'Add Feature'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FeatureDrawer;
