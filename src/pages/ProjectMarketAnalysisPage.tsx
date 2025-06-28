
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useProjectMarketAnalysis } from '@/hooks/useProjectMarketAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, ArrowLeft, Lightbulb } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import PageLayout from '@/components/layout/PageLayout';
import MarketAnalysisDrawer from '@/components/market-analysis/MarketAnalysisDrawer';
import type { MarketGapAnalysis } from '@/lib/types';

const ProjectMarketAnalysisPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { marketAnalysis, marketGaps, isLoading: analysisLoading, updateMarketAnalysis } = useProjectMarketAnalysis(id || '');
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  
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

  const handleSaveAnalysis = async (analysis: MarketGapAnalysis | null, gaps: string) => {
    return await updateMarketAnalysis(analysis, gaps);
  };

  const hasAnalysisData = marketAnalysis || marketGaps;

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
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Market Analysis</h1>
                  <p className="text-gray-600">Analyze market gaps and positioning for {project.title}</p>
                </div>
                <Button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  {hasAnalysisData ? 'Edit Analysis' : 'Add Analysis'}
                </Button>
              </div>
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
                  <Button onClick={() => setDrawerOpen(true)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Create Market Analysis
                  </Button>
                </div>
              </div>
            ) : (
              // Analysis Content
              <div className="space-y-6">
                {marketGaps && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Market Gaps Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {marketGaps}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {marketAnalysis && (
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {marketAnalysis.marketGaps && marketAnalysis.marketGaps.length > 0 && (
                      <Card className="bg-teal-50 border-teal-200">
                        <CardHeader>
                          <CardTitle className="text-teal-800">Identified Market Gaps</CardTitle>
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
                          <CardTitle className="text-blue-800">Positioning Suggestions</CardTitle>
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
                )}
              </div>
            )}
          </div>
        </div>

        <MarketAnalysisDrawer
          isOpen={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSave={handleSaveAnalysis}
          marketAnalysis={marketAnalysis}
          marketGaps={marketGaps}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectMarketAnalysisPage;
