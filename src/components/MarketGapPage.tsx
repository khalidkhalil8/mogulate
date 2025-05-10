
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from './Header';
import LoadingState from './ui/LoadingState';
import { analyzeMarketGaps } from '@/lib/api/marketGaps';
import type { Competitor, MarketGapAnalysis } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/components/ui/sonner";

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
    navigate('/validation-plan');
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
              <form onSubmit={handleSubmit} className="space-y-8">
                {analysis && (
                  <div className="space-y-6">
                    <Card className="bg-teal-50 border-teal-100">
                      <CardHeader>
                        <CardTitle className="text-xl">AI Market Gap Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2 text-teal-800">Identified Market Gaps:</h3>
                          <ul className="list-disc pl-5 space-y-2">
                            {analysis.marketGaps.map((gap, index) => (
                              <li key={index} className="text-gray-700">{gap}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-2 text-teal-800">Positioning Suggestions:</h3>
                          <ul className="list-disc pl-5 space-y-2">
                            {analysis.positioningSuggestions.map((suggestion, index) => (
                              <li key={index} className="text-gray-700">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div className="space-y-4">
                  <label 
                    htmlFor="marketGaps" 
                    className="block text-lg font-medium text-charcoal"
                  >
                    Detail your unique selling points and how you will solve customer problems 
                    better than existing solutions
                  </label>
                  <Textarea
                    id="marketGaps"
                    placeholder="Faster delivery than competitors, lower pricing, better user experience"
                    value={marketGaps}
                    onChange={(e) => setMarketGaps(e.target.value)}
                    className="min-h-[150px] resize-y"
                    required
                  />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2"
                    disabled={competitors.length === 0}
                  >
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
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>Get AI Suggestions</span>
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
                    disabled={!marketGaps.trim()}
                  >
                    <span>Next</span>
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Market Gaps</DialogTitle>
            <DialogDescription>
              Our AI will analyze your idea and competitors to suggest potential differentiation strategies.
              <p className="mt-2 text-amber-600">
                Note: Free tier accounts are limited to 5 AI analyses per month.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleGetAiSuggestions}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketGapPage;
