
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from '@/components/ui/sonner';
import { isOnFeatureWaitlist, joinFeatureWaitlist } from '@/lib/api/waitlist';
import { useAuth } from '@/context/AuthContext';
import EmailWaitlistDialog from '../features/EmailWaitlistDialog';

const SocialInsightsWaitlist: React.FC = () => {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  useEffect(() => {
    if (user) {
      const checkWaitlistStatus = async () => {
        const onWaitlist = await isOnFeatureWaitlist();
        setHasJoined(onWaitlist);
      };
      checkWaitlistStatus();
    }
  }, [user]);

  const handleJoinWaitlist = async () => {
    // If user is not authenticated, show email popup
    if (!user) {
      setShowEmailDialog(true);
      return;
    }
    
    // For authenticated users, join directly
    setIsJoining(true);
    
    try {
      const success = await joinFeatureWaitlist();
      
      if (success) {
        setHasJoined(true);
      }
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast.error("Could not join waitlist", {
        description: "⚠️ Something went wrong. Please try again.",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleAnonymousSuccess = () => {
    setHasJoined(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Social Insights (Coming Soon)</h2>
      
      <p className="text-gray-700">
        We're working on pulling real Reddit and Twitter posts about your idea's market. Want early access?
      </p>
      
      {hasJoined ? (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertTitle>You're on the list!</AlertTitle>
          <AlertDescription>
            Thanks for joining the waitlist. We'll notify you when Social Insights becomes available.
          </AlertDescription>
        </Alert>
      ) : (
        <Button 
          onClick={handleJoinWaitlist}
          disabled={isJoining}
          className="flex items-center gap-2"
        >
          {isJoining ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Joining waitlist...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 5h6a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" />
                <path d="M16 9h5a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-5a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4Z" />
              </svg>
              <span>Join Waitlist</span>
            </>
          )}
        </Button>
      )}
      
      <EmailWaitlistDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSuccess={handleAnonymousSuccess}
      />
    </div>
  );
};

export default SocialInsightsWaitlist;
