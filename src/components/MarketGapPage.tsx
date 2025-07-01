
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from './ui/LoadingState';
import { analyzeMarketGaps } from '@/lib/api/marketGaps';
import type { Competitor, MarketGapAnalysis } from '@/lib/types';
import { toast } from "@/components/ui/sonner";
import MarketGapForm from './market-gaps/MarketGapForm';
import AISuggestionDialog from './market-gaps/AISuggestionDialog';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';

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
  const [marketGaps, setMarketGaps] = useState(initialMarketGaps);
  const [uniqueValue, setUniqueValue] = useState('');
  const [analysis, setAnalysis] = useState<MarketGapAnalysis | undefined>(initialAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleGetAiSuggestions = async () => {
    setIsDialogOpen(false);
    setIsLoading(true);
    try {
      const result = await analyzeMarketGaps(idea, competitors);
      if (result.analysis) {
        setAnalysis(result.analysis);
        toast.success("Successfully generated market gap analysis");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine both fields for the existing data structure
    const combinedGaps = `Market Gaps: ${marketGaps}\n\nUnique Value Proposition: ${uniqueValue}`;
    onMarketGapsSubmit(combinedGaps, analysis);
    navigate('/features');
  };

  const handleBack = () => {
    // Save current market gaps before navigating back
    const combinedGaps = `Market Gaps: ${marketGaps}\n\nUnique Value Proposition: ${uniqueValue}`;
    onMarketGapsSubmit(combinedGaps, analysis);
    navigate('/competitors');
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Stand Out in the Market</h1>
            <p className="text-gray-600">Identify the gaps your product fills — and how you'll position it to win over customers.</p>
          </div>
          
          {isLoading ? (
            <LoadingState message="Hang tight - our AI is generating an analysis" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <MarketGapForm
                marketGaps={marketGaps}
                uniqueValue={uniqueValue}
                analysis={analysis}
                setMarketGaps={setMarketGaps}
                setUniqueValue={setUniqueValue}
                onGetAiSuggestions={() => setIsDialogOpen(true)}
                onSubmit={handleSubmit}
                isCompetitorsAvailable={competitors.length > 0}
              />
              
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
                  type="submit" 
                  className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </Button>
              </div>
            </form>
          )}
          
          <AISuggestionDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onGenerateAnalysis={handleGetAiSuggestions}
          />
        </div>
      </div>
    </div>
  );
};

export default MarketGapPage;
