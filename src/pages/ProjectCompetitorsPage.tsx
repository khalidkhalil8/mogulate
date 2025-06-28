
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useProjectCompetitors } from '@/hooks/useProjectCompetitors';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowLeft, Edit, Trash2, ExternalLink } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import PageLayout from '@/components/layout/PageLayout';
import CompetitorDrawer from '@/components/competitors/CompetitorDrawer';
import type { Competitor } from '@/lib/types';

const ProjectCompetitorsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { competitors, isLoading: competitorsLoading, addCompetitor, updateCompetitor, removeCompetitor } = useProjectCompetitors(id || '');
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  
  const project = projects.find(p => p.id === id);
  
  if (projectsLoading || competitorsLoading) {
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

  const handleAddCompetitor = () => {
    setEditingCompetitor(null);
    setDrawerOpen(true);
  };

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setDrawerOpen(true);
  };

  const handleSaveCompetitor = async (competitor: Competitor) => {
    if (editingCompetitor) {
      return await updateCompetitor(competitor.id, competitor);
    } else {
      return await addCompetitor(competitor);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    if (confirm('Are you sure you want to delete this competitor?')) {
      await removeCompetitor(competitorId);
    }
  };

  const formatWebsiteUrl = (website: string) => {
    if (!website) return '';
    return website.startsWith('http') ? website : `https://${website}`;
  };

  return (
    <PageLayout>
      <div className="min-h-screen">
        <Helmet>
          <title>Competitors - {project.title} | Mogulate</title>
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
                  <h1 className="text-3xl font-bold mb-2">Competitors</h1>
                  <p className="text-gray-600">Analyze your competition for {project.title}</p>
                </div>
                <Button onClick={handleAddCompetitor} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Competitor
                </Button>
              </div>
            </div>

            {/* Content */}
            {competitors.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">No competitors yet</h2>
                  <p className="text-gray-600 mb-6">
                    Start analyzing your competition by adding competitors to understand the market landscape.
                  </p>
                  <Button onClick={handleAddCompetitor} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Competitor
                  </Button>
                </div>
              </div>
            ) : (
              // Competitors Grid
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {competitors.map((competitor) => (
                  <Card key={competitor.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{competitor.name}</h3>
                            {competitor.isAiGenerated && (
                              <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full">
                                AI Found
                              </span>
                            )}
                          </div>
                          {competitor.website && (
                            <a
                              href={formatWebsiteUrl(competitor.website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-3"
                            >
                              {competitor.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCompetitor(competitor)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!competitor.isAiGenerated && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCompetitor(competitor.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {competitor.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <CompetitorDrawer
          isOpen={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSave={handleSaveCompetitor}
          competitor={editingCompetitor}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectCompetitorsPage;
