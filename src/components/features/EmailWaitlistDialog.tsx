
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmailWaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EmailWaitlistDialog: React.FC<EmailWaitlistDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('join-anonymous-waitlist', {
        body: { email: email.trim() },
      });

      if (error) {
        console.error('Error joining waitlist:', error);
        toast.error('Could not join waitlist', {
          description: '⚠️ Something went wrong. Please try again.',
        });
        return;
      }

      if (data?.success) {
        if (data.alreadyJoined) {
          toast.info('Already on waitlist', {
            description: 'This email is already signed up for the waitlist',
          });
        } else {
          toast.success('Joined waitlist!', {
            description: data.message || "We'll notify you when these features launch.",
          });
        }
        
        onSuccess();
        onOpenChange(false);
        setEmail('');
      } else {
        toast.error('Could not join waitlist', {
          description: data?.error || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Could not join waitlist', {
        description: '⚠️ Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join the Waitlist</DialogTitle>
          <DialogDescription>
            Enter your email to get notified when these exciting features launch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="gradient-bg border-none hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </>
              ) : (
                'Join Waitlist'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailWaitlistDialog;
