
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useProjectMarketAnalysis } from '@/hooks/useProjectMarketAnalysis';
import { analyzeMarketGaps } from '@/lib/api/marketGaps';
import { toast } from '@/components/ui/sonner';
import LoadingState from '@/components/ui/LoadingState';
import PageLayout from '@/components/layout/PageLayout';
import MarketGapsScoringDisplay from '@/components/market-gaps/MarketGapsScoringDisplay';
import MarketGapAnalysisCard from '@/components/market-gaps/MarketGapAnalysisCard';
import type { MarketGapWithScore } from '@/lib/api/marketGapsScoring';

const ProjectMarketAnalysisPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { 
    marketAnalysis, 
    isLoading, 
    updateMarketAnalysis
  } = useProjectMarketAnalysis(id || '');
  
  const [selectedGapIndex, setSelectedGapIndex] = useState<number | undefined>();
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  const project = projects.find(p => p.id === id);

  if (!id || !project) {
    return (
      <PageLayout>
        <div className="p-6">
          <div className="text-center text-red-600">
            Project ID not found
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleBackClick = () => {
    navigate(`/project/${id}`);
  };

  const handleRerunAnalysis = async () => {
    if (!project.idea || !project.competitors) {
      toast.error('Missing project data', {
        description: 'Please ensure your project has an idea and competitors before running market analysis.'
      });
      return;
    }

    setIsRunningAnalysis(true);
    try {
      const result = await analyzeMarketGaps(project.idea, project.competitors);
      
      if (result.analysis) {
        await updateMarketAnalysis(result.analysis);
        toast.success('Market analysis completed successfully!');
      } else {
        toast.error('Failed to generate market analysis');
      }
    } catch (error) {
      console.error('Error running market analysis:', error);
      toast.error('Failed to run market analysis');
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  // Helper function to check if the analysis is in the new scoring format
  const isMarketGapScoringAnalysis = (analysis: any): analysis is { marketGaps: MarketGapWithScore[] } => {
    return analysis && 
           Array.isArray(analysis.marketGaps) && 
           analysis.marketGaps.length > 0 && 
           typeof analysis.marketGaps[0] === 'object' && 
           'score' in analysis.marketGaps[0];
  };

  return (
    <PageLayout>
      <div className="min-h-screen">
        <Helmet>
          <title>{project.title} Market Analysis | Mogulate</title>
        </Helmet>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">Market Analysis</h1>
              <p className="text-gray-600 mt-2">
                Understand your market position and identify opportunities.
              </p>
            </div>

            {isLoading ? (
              <LoadingState />
            ) : (
              <div className="space-y-6">
                {marketAnalysis ? (
                  // Check if it's the new scoring format or legacy format
                  isMarketGapScoringAnalysis(marketAnalysis) ? (
                    <MarketGapsScoringDisplay
                      analysis={marketAnalysis}
                      selectedGapIndex={selectedGapIndex}
                      onSelectGap={setSelectedGapIndex}
                    />
                  ) : (
                    <MarketGapAnalysisCard analysis={marketAnalysis} />
                  )
                ) : (
                  <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="text-center py-8">
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">
                        No Market Analysis Available
                      </h3>
                      <p className="text-blue-700 mb-4">
                        Run the analysis to discover market gaps and positioning strategies.
                      </p>
                      <Button
                        onClick={handleRerunAnalysis}
                        disabled={isRunningAnalysis}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRunningAnalysis ? 'animate-spin' : ''}`} />
                        {isRunningAnalysis ? 'Running Analysis...' : 'Run Analysis'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {marketAnalysis && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleRerunAnalysis}
                      disabled={isRunningAnalysis}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRunningAnalysis ? 'animate-spin' : ''}`} />
                      {isRunningAnalysis ? 'Running Analysis...' : 'Run New Analysis'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectMarketAnalysisPage;
