
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FeedbackEntry } from '@/hooks/useFeedbackEntries';

interface FeedbackDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: Omit<FeedbackEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onUpdate?: (entryId: string, updates: Partial<FeedbackEntry>) => void;
  entry?: FeedbackEntry | null;
  projectId: string;
}

const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  onUpdate,
  entry,
  projectId,
}) => {
  const [date, setDate] = useState('');
  const [feedbackSource, setFeedbackSource] = useState('');
  const [sourceUsername, setSourceUsername] = useState('');
  const [feedbackSummary, setFeedbackSummary] = useState('');

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setFeedbackSource(entry.feedback_source);
      setSourceUsername(entry.source_username || '');
      setFeedbackSummary(entry.feedback_summary);
    } else {
      setDate('');
      setFeedbackSource('');
      setSourceUsername('');
      setFeedbackSummary('');
    }
  }, [entry, isOpen]);

  const handleSave = () => {
    if (!date || !feedbackSource || !feedbackSummary) {
      return;
    }

    const feedbackData = {
      project_id: projectId,
      date,
      feedback_source: feedbackSource,
      source_username: sourceUsername || undefined,
      feedback_summary: feedbackSummary,
    };

    if (entry && onUpdate) {
      onUpdate(entry.id, feedbackData);
    } else {
      onSave(feedbackData);
    }

    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[720px]">
        <SheetHeader>
          <SheetTitle>{entry ? 'Edit Feedback' : 'Add Feedback'}</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-source">Feedback Source *</Label>
            <Input
              id="feedback-source"
              placeholder="e.g., Reddit, Twitter, Interview"
              value={feedbackSource}
              onChange={(e) => setFeedbackSource(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source-username">Source Username</Label>
            <Input
              id="source-username"
              placeholder="@username (optional)"
              value={sourceUsername}
              onChange={(e) => setSourceUsername(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-summary">Feedback Summary *</Label>
            <Textarea
              id="feedback-summary"
              placeholder="Summarize the feedback received..."
              value={feedbackSummary}
              onChange={(e) => setFeedbackSummary(e.target.value)}
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
              disabled={!date || !feedbackSource || !feedbackSummary}
            >
              {entry ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FeedbackDrawer;
