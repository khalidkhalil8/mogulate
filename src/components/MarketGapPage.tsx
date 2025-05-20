
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import LoadingState from './ui/LoadingState';
import { analyzeMarketGaps } from '@/lib/api/marketGaps';
import type { Competitor, MarketGapAnalysis } from '@/lib/types';
import { toast } from "@/components/ui/sonner";
import MarketGapForm from './market-gaps/MarketGapForm';
import AISuggestionDialog from './market-gaps/AISuggestionDialog';
import SocialInsightsWaitlist from './market-gaps/SocialInsightsWaitlist';
import { useAuth } from '@/context/AuthContext';

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
    onMarketGapsSubmit(marketGaps, analysis);
    navigate('/idea/validation-plan');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container-width max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              What Will You Do Differently?
            </h1>
            
            {isLoading ? (
              <LoadingState message="Hang tight - our AI is generating an analysis" />
            ) : (
              <MarketGapForm
                marketGaps={marketGaps}
                analysis={analysis}
                setMarketGaps={setMarketGaps}
                onGetAiSuggestions={() => setIsDialogOpen(true)}
                onSubmit={handleSubmit}
                isCompetitorsAvailable={competitors.length > 0}
              />
            )}
            
            {user && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <SocialInsightsWaitlist />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <AISuggestionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onGenerateAnalysis={handleGetAiSuggestions}
      />
    </div>
  );
};

export default MarketGapPage;
