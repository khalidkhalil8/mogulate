
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusCircle, XCircle, MessageSquareShare, Sparkles, Map, LineChart } from "lucide-react";
import { joinFeatureWaitlist, leaveFeatureWaitlist, getUserWaitlistEntry } from "@/lib/api/waitlist";
import { format, parseISO } from "date-fns";

// Features that are available in the waitlist
const UPCOMING_FEATURES = [
  { 
    icon: MessageSquareShare,
    name: "Social Insights", 
    description: "Pulling real Reddit & Twitter posts about your market to discover trending topics and pain points" 
  },
  { 
    icon: Sparkles,
    name: "AI Assistant", 
    description: "Get personalized recommendations and on-demand guidance for your business idea" 
  },
  { 
    icon: Map,
    name: "Competitor Mapping", 
    description: "Visual competitive landscape analysis and positioning with deep dives into rivals" 
  },
  {
    icon: LineChart,
    name: "Financial Projections",
    description: "Generate financial models and projections to determine the viability of your idea"
  }
];

const FeatureWaitlists: React.FC = () => {
  const [waitlistEntry, setWaitlistEntry] = useState<{ id: string, joined_at: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWaitlistStatus = async () => {
      setIsLoading(true);
      try {
        const data = await getUserWaitlistEntry();
        setWaitlistEntry(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistStatus();
  }, []);

  const handleJoinWaitlist = async () => {
    const success = await joinFeatureWaitlist();
    if (success) {
      // Refresh the waitlist data
      const data = await getUserWaitlistEntry();
      setWaitlistEntry(data);
    }
  };

  const handleLeaveWaitlist = async () => {
    const success = await leaveFeatureWaitlist();
    if (success) {
      setWaitlistEntry(null);
    }
  };

  const isOnWaitlist = !!waitlistEntry;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Features Waitlist</CardTitle>
        <CardDescription>
          Join our waitlist to get early access to these upcoming features
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UPCOMING_FEATURES.map((feature) => {
                const Icon = feature.icon;
                
                return (
                  <div 
                    key={feature.name}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-teal-600" />
                      <h3 className="font-medium">{feature.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-gray-50 border rounded-lg p-6 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Waitlist Status</h3>
                    <Badge variant={isOnWaitlist ? "default" : "outline"}>
                      {isOnWaitlist ? "Joined" : "Not Joined"}
                    </Badge>
                  </div>
                  
                  {waitlistEntry && (
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Joined on {format(parseISO(waitlistEntry.joined_at), 'PP')}
                    </div>
                  )}
                </div>
                
                {isOnWaitlist ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={handleLeaveWaitlist}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Leave Waitlist
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-teal-600 border-teal-200 hover:bg-teal-50"
                    onClick={handleJoinWaitlist}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Join Waitlist
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        We'll notify you when these features become available for your subscription tier.
      </CardFooter>
    </Card>
  );
};

export default FeatureWaitlists;
