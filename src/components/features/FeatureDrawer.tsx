
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
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

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

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'Planned':
        return <Circle className="h-4 w-4 text-gray-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priorityValue: string) => {
    switch (priorityValue) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-amber-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[720px]">
        <SheetHeader>
          <SheetTitle>
            {feature ? 'Edit Feature' : 'Add Feature'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Feature Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter feature title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature in detail..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as 'Planned' | 'In Progress' | 'Done')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">
                      <div className="flex items-center gap-2">
                        {getStatusIcon('Planned')}
                        <span>Planned</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="In Progress">
                      <div className="flex items-center gap-2">
                        {getStatusIcon('In Progress')}
                        <span>In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Done">
                      <div className="flex items-center gap-2">
                        {getStatusIcon('Done')}
                        <span>Done</span>
                      </div>
                    </SelectItem>
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
                    <SelectItem value="Low">
                      <span className={getPriorityColor('Low')}>Low</span>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <span className={getPriorityColor('Medium')}>Medium</span>
                    </SelectItem>
                    <SelectItem value="High">
                      <span className={getPriorityColor('High')}>High</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
