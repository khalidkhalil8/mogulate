
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from './ui/LoadingState';
import { analyzeMarketGaps } from '@/lib/api/marketGaps';
import type { Competitor, MarketGapAnalysis } from '@/lib/types';
import { toast } from "@/components/ui/sonner";
import AISuggestionDialog from './market-gaps/AISuggestionDialog';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface MarketGapPageProps {
  idea: string;
  competitors: Competitor[];
  initialMarketGaps?: string;
  initialAnalysis?: MarketGapAnalysis;
  onMarketGapsSubmit: (marketGaps: string, analysis: MarketGapAnalysis | undefined) => void;
}

const MarketGapPage: React.FC<MarketGapPageProps> = ({
  idea,
  competitors,
  initialMarketGaps = "",
  initialAnalysis,
  onMarketGapsSubmit
}) => {
  const [analysis, setAnalysis] = useState<MarketGapAnalysis | undefined>(initialAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(!!initialAnalysis);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeMarketGaps(idea, competitors);
      if (result.analysis) {
        setAnalysis(result.analysis);
        setHasRunAnalysis(true);
        toast.success("Successfully generated market gap analysis");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = () => {
    // Save the analysis data and proceed
    onMarketGapsSubmit(initialMarketGaps, analysis);
    navigate('/features');
  };

  const handleBack = () => {
    // Save current analysis before navigating back
    onMarketGapsSubmit(initialMarketGaps, analysis);
    navigate('/competitors');
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <LoadingState message="Hang tight - our AI is generating an analysis" />
          ) : !hasRunAnalysis ? (
            // Initial welcome state
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold mb-4">Discover Opportunities in the Market</h1>
                <p className="text-gray-600 text-lg mb-8">
                  Our AI will analyze your idea and competitors to identify gaps and unique angles you can pursue.
                </p>
                
                <Button 
                  onClick={handleRunAnalysis}
                  className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
                  disabled={competitors.length === 0}
                >
                  Run Market Analysis
                </Button>
                
                {competitors.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">
                    Please add competitors first to run the analysis
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Results state
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Market Analysis Results</h1>
                <p className="text-gray-600">Here's what our AI discovered about your market opportunities</p>
              </div>
              
              {analysis && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Identified Market Gaps */}
                  <Card className="bg-teal-50 border-teal-200">
                    <CardHeader>
                      <CardTitle className="text-teal-800 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Identified Market Gaps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.marketGaps.map((gap, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full mt-2"></span>
                            <span className="text-gray-700">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Positioning Suggestions */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Positioning Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.positioningSuggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                            <span className="text-gray-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Disclaimer */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  You can update this analysis later if you change your idea or add more competitors.
                </p>
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </Button>
                
                <Button 
                  onClick={handleNext}
                  className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketGapPage;
