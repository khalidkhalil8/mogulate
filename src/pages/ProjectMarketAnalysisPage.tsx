
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import LoadingState from '@/components/ui/LoadingState';
import PageLayout from '@/components/layout/PageLayout';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

const ProjectMarketAnalysisPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  
  const project = projects.find(p => p.id === id);
  
  if (projectsLoading) {
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

  // Parse market gap analysis data
  const marketGapScoringAnalysis = project.market_gap_analysis as MarketGapScoringAnalysis | null;
  const selectedGapIndex = project.selected_gap_index;
  const hasAnalysisData = marketGapScoringAnalysis?.marketGaps && marketGapScoringAnalysis.marketGaps.length > 0;
  const lastAnalyzed = project.updated_at ? format(new Date(project.updated_at), 'MMMM d, yyyy') : null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
                  These opportunities were generated based on your idea and competition.
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
                    <Crown className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">No market analysis available</h2>
                  <p className="text-gray-600 mb-6">
                    Market analysis is generated during the project setup process.
                  </p>
                </div>
              </div>
            ) : (
              // Analysis Content - Display all gaps with selected one highlighted
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {marketGapScoringAnalysis.marketGaps.map((gap, index) => {
                    const isSelected = selectedGapIndex === index;
                    
                    return (
                      <Card 
                        key={index} 
                        className={`relative transition-all duration-200 ${
                          isSelected 
                            ? 'border-teal-500 border-2 bg-teal-50 shadow-lg' 
                            : 'border-gray-200 opacity-75'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-teal-600 text-white flex items-center gap-1">
                              <Crown className="h-3 w-3" />
                              Selected Opportunity
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Market Gap</CardTitle>
                            <Badge className={`${getScoreColor(gap.score)} text-white`}>
                              {gap.score}/10
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Gap Description:</h4>
                            <p className={isSelected ? "text-teal-800" : "text-gray-700"}>
                              {gap.gap}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Positioning Suggestion:</h4>
                            <p className={isSelected ? "text-teal-800" : "text-gray-700"}>
                              {gap.positioningSuggestion}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Score Rationale:</h4>
                            <p className={isSelected ? "text-teal-700 text-sm" : "text-gray-600 text-sm"}>
                              {gap.rationale}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectMarketAnalysisPage;
