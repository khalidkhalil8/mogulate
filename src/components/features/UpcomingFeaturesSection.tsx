
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Sparkles, MessageSquareShare, Map, LineChart, MessageCircle } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { isOnFeatureWaitlist, joinFeatureWaitlist } from '@/lib/api/waitlist';
import EmailWaitlistDialog from './EmailWaitlistDialog';

const UpcomingFeaturesSection: React.FC = () => {
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
    <section className="py-16 bg-gray-50 px-4">
      <div className="container-width">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Features Coming Soon</h2>
            <p className="text-gray-600 text-lg">
              We're building powerful new tools to help you validate and grow your idea, including:
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow">
              <div className="flex items-center mb-4">
                <MessageSquareShare className="w-6 h-6 text-teal-600 mr-2" />
                <h3 className="font-semibold text-xl">Social Insights</h3>
              </div>
              <p className="text-gray-600">
                Pulling real Reddit & Twitter posts about your market to discover trending topics and pain points.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-teal-600 mr-2" />
                <h3 className="font-semibold text-xl">AI Assistant</h3>
              </div>
              <p className="text-gray-600">
                Get personalized recommendations and on-demand guidance for your business idea.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow">
              <div className="flex items-center mb-4">
                <Map className="w-6 h-6 text-teal-600 mr-2" />
                <h3 className="font-semibold text-xl">Competitor Mapping</h3>
              </div>
              <p className="text-gray-600">
                Visual competitive landscape analysis and positioning with deep dives into rivals.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow">
              <div className="flex items-center mb-4">
                <LineChart className="w-6 h-6 text-teal-600 mr-2" />
                <h3 className="font-semibold text-xl">Financial Projections</h3>
              </div>
              <p className="text-gray-600">
                Generate financial models and projections to determine the viability of your idea.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow">
              <div className="flex items-center mb-4">
                <MessageCircle className="w-6 h-6 text-teal-600 mr-2" />
                <h3 className="font-semibold text-xl">Feedback Tracking</h3>
              </div>
              <p className="text-gray-600">
                Centralized hub for collecting, managing, and analyzing user feedback to guide your roadmap.
              </p>
            </div>
          </div>
          
          {hasJoined ? (
            <Alert variant="default" className="bg-green-50 border-green-200 max-w-xl mx-auto">
              <AlertTitle>You're on the waitlist!</AlertTitle>
              <AlertDescription>
                Thanks for joining. We'll notify you when these features become available.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center">
              <Button 
                onClick={handleJoinWaitlist}
                disabled={isJoining}
                size="lg"
                className="px-8 py-6 text-lg gradient-bg border-none hover:opacity-90 button-transition"
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
                  "Join the Waitlist"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <EmailWaitlistDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSuccess={handleAnonymousSuccess}
      />
    </section>
  );
};

export default UpcomingFeaturesSection;
