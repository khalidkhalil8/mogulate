
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import { useProjectCredits } from '@/hooks/useProjectCredits';
import { useProjectRerunAnalysis } from '@/hooks/useProjectRerunAnalysis';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RerunConfirmationDialog from '@/components/project/RerunConfirmationDialog';
import { 
  Target, 
  Users, 
  CheckSquare, 
  ListTodo, 
  Edit,
  TrendingUp,
  Lightbulb,
  Settings,
  AlertCircle,
  Home,
  RefreshCw
} from 'lucide-react';

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();
  const { user } = useAuth();
  const { projectCredits } = useProjectCredits(id || '');
  const { 
    isLoading: isRerunning, 
    rerunCompetitorDiscovery, 
    rerunMarketAnalysis, 
    rerunFeatureGeneration, 
    rerunValidationPlan 
  } = useProjectRerunAnalysis(id || '');

  const [rerunDialog, setRerunDialog] = useState<{
    isOpen: boolean;
    type: 'competitors' | 'market' | 'features' | 'validation' | null;
    currentInput?: string;
  }>({
    isOpen: false,
    type: null,
  });

  // Find the project by ID
  const project = projects.find(p => p.id === id);

  // Handle loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Handle project not found with improved messaging
  if (!project) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Project Not Found</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              This project may have been deleted, or you don't have permission to access it. 
              Please check the URL or contact support if you believe this is an error.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleWidgetClick = (path: string) => {
    navigate(path);
  };

  const handleEditProject = () => {
    navigate(`/project/${id}/edit`);
  };

  const handleRerunClick = (type: 'competitors' | 'market' | 'features' | 'validation', currentInput?: string) => {
    if (!projectCredits.canUseCredits) {
      navigate('/settings');
      return;
    }
    
    setRerunDialog({
      isOpen: true,
      type,
      currentInput
    });
  };

  const handleRerunConfirm = async (editedInput?: string) => {
    if (!project || !rerunDialog.type) return;

    const inputToUse = editedInput || rerunDialog.currentInput || project.idea || '';
    let success = false;

    switch (rerunDialog.type) {
      case 'competitors':
        success = await rerunCompetitorDiscovery(inputToUse);
        break;
      case 'market':
        success = await rerunMarketAnalysis(inputToUse, project.competitors || []);
        break;
      case 'features':
        const selectedGap = project.market_analysis?.marketGaps?.[project.selected_gap_index || 0];
        const positioning = selectedGap?.positioningSuggestion || '';
        success = await rerunFeatureGeneration(inputToUse, project.competitors || [], positioning);
        break;
      case 'validation':
        const selectedGapForValidation = project.market_analysis?.marketGaps?.[project.selected_gap_index || 0];
        const positioningForValidation = selectedGapForValidation?.positioningSuggestion || '';
        success = await rerunValidationPlan(inputToUse, positioningForValidation, project.competitors || [], project.features || []);
        break;
    }

    if (success) {
      setRerunDialog({ isOpen: false, type: null });
    }
  };

  const getRerunDialogProps = () => {
    switch (rerunDialog.type) {
      case 'competitors':
        return {
          title: 'Rerun Competitor Discovery',
          description: 'Re-discover competitors based on your project idea. This will find new competitors and replace your existing list.',
          analysisType: 'competitor',
          allowInputEdit: true
        };
      case 'market':
        return {
          title: 'Rerun Market Analysis',
          description: 'Re-analyze market gaps and positioning opportunities. This will generate new market insights based on your current competitors.',
          analysisType: 'market analysis',
          allowInputEdit: true
        };
      case 'features':
        return {
          title: 'Rerun Feature Generation',
          description: 'Generate new product features based on your current market positioning and competitors.',
          analysisType: 'feature',
          allowInputEdit: true
        };
      case 'validation':
        return {
          title: 'Rerun Validation Plan',
          description: 'Generate a new validation plan based on your current features and market positioning.',
          analysisType: 'validation plan',
          allowInputEdit: true
        };
      default:
        return {
          title: '',
          description: '',
          analysisType: '',
          allowInputEdit: false
        };
    }
  };

  // Get project statistics
  const stats = {
    competitors: Array.isArray(project.competitors) ? project.competitors.length : 0,
    features: Array.isArray(project.features) ? project.features.length : 0,
    validationSteps: Array.isArray(project.validation_plan) ? project.validation_plan.length : 0,
    creditsUsed: project.credits_used || 0,
    hasMarketAnalysis: !!project.market_analysis
  };

  return (
    <PageLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                <p className="text-gray-600">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm">
                  {stats.creditsUsed} credits used
                </Badge>
                <Button
                  variant="outline"
                  onClick={handleEditProject}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Project
                </Button>
              </div>
            </div>
          </div>

          {/* Project Idea */}
          {project.idea && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Project Idea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{project.idea}</p>
              </CardContent>
            </Card>
          )}

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Market Analysis Widget */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={stats.hasMarketAnalysis ? "default" : "secondary"}>
                      {stats.hasMarketAnalysis ? "Complete" : "Not Started"}
                    </Badge>
                  </div>
                  {stats.hasMarketAnalysis && (
                    <p className="text-sm text-gray-600">
                      {(() => {
                        const marketAnalysis = project.market_analysis;
                        if (marketAnalysis?.marketGaps && project.selected_gap_index !== undefined) {
                          const selectedGap = marketAnalysis.marketGaps[project.selected_gap_index];
                          if (selectedGap?.gap) {
                            return selectedGap.gap.length > 100 
                              ? `${selectedGap.gap.substring(0, 100)}...`
                              : selectedGap.gap;
                          }
                        }
                        return "Market gaps identified and analyzed";
                      })()}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWidgetClick(`/project/${id}/market-analysis`);
                      }}
                      className="flex-1"
                    >
                      View
                    </Button>
                    {stats.hasMarketAnalysis && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRerunClick('market', project.idea);
                        }}
                        disabled={isRerunning}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Rerun
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competitors Widget */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Competitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Found:</span>
                    <Badge variant="outline">{stats.competitors}</Badge>
                  </div>
                  {stats.competitors > 0 && (
                    <p className="text-sm text-gray-600">
                      {stats.competitors} competitor{stats.competitors !== 1 ? 's' : ''} analyzed
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWidgetClick(`/project/${id}/competitors`);
                      }}
                      className="flex-1"
                    >
                      View
                    </Button>
                    {project.idea && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRerunClick('competitors', project.idea);
                        }}
                        disabled={isRerunning}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Rerun
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Widget */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckSquare className="h-5 w-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Planned:</span>
                    <Badge variant="outline">{stats.features}</Badge>
                  </div>
                  {stats.features > 0 && (
                    <p className="text-sm text-gray-600">
                      {stats.features} feature{stats.features !== 1 ? 's' : ''} defined
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWidgetClick(`/project/${id}/features`);
                      }}
                      className="flex-1"
                    >
                      View
                    </Button>
                    {project.idea && stats.competitors > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRerunClick('features', project.idea);
                        }}
                        disabled={isRerunning}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Rerun
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Plan Widget */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Validation Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Steps:</span>
                    <Badge variant="outline">{stats.validationSteps}</Badge>
                  </div>
                  {stats.validationSteps > 0 && (
                    <p className="text-sm text-gray-600">
                      {stats.validationSteps} validation step{stats.validationSteps !== 1 ? 's' : ''} planned
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWidgetClick(`/project/${id}/validation-plan`);
                      }}
                      className="flex-1"
                    >
                      View
                    </Button>
                    {project.idea && stats.competitors > 0 && stats.features > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRerunClick('validation', project.idea);
                        }}
                        disabled={isRerunning}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Rerun
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Widget */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleWidgetClick(`/project/${id}/todos`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListTodo className="h-5 w-5" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manage:</span>
                    <Badge variant="outline">To-Do List</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Track progress and milestones
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Tracking Widget */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleWidgetClick(`/project/${id}/feedback`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Feedback Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Track:</span>
                    <Badge variant="outline">User Feedback</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Monitor user responses and insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Rerun Confirmation Dialog */}
      <RerunConfirmationDialog
        isOpen={rerunDialog.isOpen}
        onOpenChange={(open) => setRerunDialog(prev => ({ ...prev, isOpen: open }))}
        onConfirm={handleRerunConfirm}
        isLoading={isRerunning}
        currentInput={rerunDialog.currentInput}
        {...getRerunDialogProps()}
      />
    </PageLayout>
  );
};

export default ProjectPage;
