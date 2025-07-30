
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Competitor } from '@/lib/types';

interface AddCompetitorFormProps {
  onSave: (competitor: Competitor) => void;
  onCancel: () => void;
}

const AddCompetitorForm: React.FC<AddCompetitorFormProps> = ({
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      return;
    }

    const newCompetitor: Competitor = {
      id: `competitor-${Date.now()}`,
      name: name.trim(),
      website: website.trim(),
      description: description.trim(),
      isAiGenerated: false
    };

    onSave(newCompetitor);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Competitor Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter competitor name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the competitor"
          className="min-h-[80px]"
          required
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Competitor
        </Button>
      </div>
    </form>
  );
};

export default AddCompetitorForm;
