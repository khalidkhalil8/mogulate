
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Competitor } from '@/lib/types';

interface CompetitorDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (competitor: Competitor) => Promise<boolean>;
  competitor?: Competitor | null;
}

const CompetitorDrawer: React.FC<CompetitorDrawerProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  competitor,
}) => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (competitor) {
      setName(competitor.name);
      setWebsite(competitor.website);
      setDescription(competitor.description);
    } else {
      setName('');
      setWebsite('');
      setDescription('');
    }
  }, [competitor, isOpen]);

  const handleSave = async () => {
    if (!name || !description) {
      return;
    }

    const competitorData: Competitor = {
      id: competitor?.id || `comp-${Math.random().toString(36).substring(2, 9)}`,
      name,
      website,
      description,
      isAiGenerated: competitor?.isAiGenerated || false,
    };

    const success = await onSave(competitorData);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[700px]">
        <SheetHeader>
          <SheetTitle>{competitor ? 'Edit Competitor' : 'Add Competitor'}</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Competitor name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the competitor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!name || !description}
            >
              {competitor ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CompetitorDrawer;
