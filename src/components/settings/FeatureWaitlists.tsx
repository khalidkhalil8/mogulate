
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusCircle, XCircle } from "lucide-react";
import { joinFeatureWaitlist, leaveFeatureWaitlist, getUserWaitlists, FeatureWaitlist } from "@/lib/api/waitlist";
import { format, parseISO } from "date-fns";

// Features that are available for waitlist
const AVAILABLE_FEATURES = [
  { 
    name: "ai_assistant", 
    display: "AI Assistant", 
    description: "Get personalized recommendations and insights for your business ideas" 
  },
  { 
    name: "competitors_map", 
    display: "Competitor Mapping", 
    description: "Visual competitive landscape analysis and positioning" 
  },
  { 
    name: "financial_projections", 
    display: "Financial Projections", 
    description: "Generate financial models and projections for your idea" 
  }
];

const FeatureWaitlists: React.FC = () => {
  const [waitlists, setWaitlists] = useState<FeatureWaitlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWaitlists = async () => {
      setIsLoading(true);
      try {
        const data = await getUserWaitlists();
        setWaitlists(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlists();
  }, []);

  const handleJoinWaitlist = async (featureName: string) => {
    const success = await joinFeatureWaitlist(featureName);
    if (success) {
      // Refresh the waitlist data
      const data = await getUserWaitlists();
      setWaitlists(data);
    }
  };

  const handleLeaveWaitlist = async (featureName: string) => {
    const success = await leaveFeatureWaitlist(featureName);
    if (success) {
      // Refresh the waitlist data
      const data = await getUserWaitlists();
      setWaitlists(data);
    }
  };

  const isOnWaitlist = (featureName: string) => {
    return waitlists.some(w => w.feature_name === featureName);
  };

  const getJoinedDate = (featureName: string) => {
    const waitlist = waitlists.find(w => w.feature_name === featureName);
    return waitlist ? waitlist.joined_at : null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Feature Waitlists</CardTitle>
        <CardDescription>
          Join waitlists for upcoming features to get early access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {AVAILABLE_FEATURES.map((feature) => {
              const onWaitlist = isOnWaitlist(feature.name);
              const joinedDate = getJoinedDate(feature.name);
              
              return (
                <div 
                  key={feature.name}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{feature.display}</h3>
                      <Badge variant={onWaitlist ? "default" : "outline"}>
                        {onWaitlist ? "Joined" : "Coming Soon"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                    {joinedDate && (
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Joined on {format(parseISO(joinedDate), 'PP')}
                      </div>
                    )}
                  </div>
                  
                  {onWaitlist ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleLeaveWaitlist(feature.name)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Leave Waitlist
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-teal-600 border-teal-200 hover:bg-teal-50"
                      onClick={() => handleJoinWaitlist(feature.name)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Join Waitlist
                    </Button>
                  )}
                </div>
              );
            })}
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
