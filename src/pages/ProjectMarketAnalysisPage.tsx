
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useProjectMarketAnalysis } from '@/hooks/useProjectMarketAnalysis';
import { analyzeMarketGaps } from '@/lib/api/marketGaps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lightbulb, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import LoadingState from '@/components/ui/LoadingState';
import PageLayout from '@/components/layout/PageLayout';
import MarketAnalysisRefreshModal from '@/components/market-analysis/MarketAnalysisRefreshModal';
import type { MarketGapAnalysis } from '@/lib/types';

const ProjectMarketAnalysisPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { marketAnalysis, isLoading: analysisLoading, updateMarketAnalysis } = useProjectMarketAnalysis(id || '');
  
  const [refreshModalOpen, setRefreshModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const project = projects.find(p => p.id === id);
  
  if (projectsLoading || analysisLoading) {
    return <LoadingState />;
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleRefreshAnalysis = async () => {
    setIsRefreshing(true);
    try {
      const result = await analyzeMarketGaps(project.idea || '', project.competitors || []);
      if (result.analysis) {
        await updateMarketAnalysis(result.analysis, '');
        toast.success("Market analysis updated successfully");
      }
    } catch (error) {
      toast.error("Failed to refresh market analysis");
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasAnalysisData = marketAnalysis;
  const lastAnalyzed = project.updated_at ? format(new Date(project.updated_at), 'MMMM d, yyyy') : null;

  return (
    <PageLayout>
      <div className="min-h-screen">
        <Helmet>
          <title>Market Analysis - {project.title} | Mogulate</title>
        </Helmet>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </div>
              
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Market Analysis</h1>
                <p className="text-gray-600">
                  These insights highlight gaps in the market and suggest how you can uniquely position your product. They were generated based on your current idea and competition.
                </p>
              </div>

              {/* Last analyzed timestamp */}
              {lastAnalyzed && hasAnalysisData && (
                <div className="text-sm text-gray-500 mb-6">
                  Last analyzed: {lastAnalyzed}
                </div>
              )}
            </div>

            {/* Content */}
            {!hasAnalysisData ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">No market analysis yet</h2>
                  <p className="text-gray-600 mb-6">
                    Start analyzing your market position by identifying gaps and opportunities in the market.
                  </p>
                  <Button onClick={() => setRefreshModalOpen(true)} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Run Market Analysis
                  </Button>
                </div>
              </div>
            ) : (
              // Analysis Content
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {marketAnalysis.marketGaps && marketAnalysis.marketGaps.length > 0 && (
                    <Card className="bg-teal-50 border-teal-200">
                      <CardHeader>
                        <CardTitle className="text-teal-800 flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Identified Market Gaps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {marketAnalysis.marketGaps.map((gap, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full mt-2"></span>
                              <span className="text-gray-700">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {marketAnalysis.positioningSuggestions && marketAnalysis.positioningSuggestions.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-blue-800 flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Positioning Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {marketAnalysis.positioningSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                              <span className="text-gray-700">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Update Market Analysis Button */}
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => setRefreshModalOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Update Market Analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <MarketAnalysisRefreshModal
          isOpen={refreshModalOpen}
          onOpenChange={setRefreshModalOpen}
          onConfirm={handleRefreshAnalysis}
          isLoading={isRefreshing}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectMarketAnalysisPage;
