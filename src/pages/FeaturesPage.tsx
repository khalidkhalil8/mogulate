
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useProjectRerunAnalysis } from '@/hooks/useProjectRerunAnalysis';
import LoadingState from '@/components/ui/LoadingState';
import FeatureDrawer from '@/components/features/FeatureDrawer';
import FeaturesPageHeader from '@/components/features/FeaturesPageHeader';
import FeaturesGrid from '@/components/features/FeaturesGrid';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Feature } from '@/lib/types';

const FeaturesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading, updateProject } = useProjects();
  const { rerunFeatureGeneration, isLoading: isRerunning } = useProjectRerunAnalysis(id || '');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | undefined>();
  
  const project = projects.find(p => p.id === id);
  const features = project?.features || [];

  useEffect(() => {
    if (!isLoading && !project) {
      navigate('/dashboard');
    }
  }, [project, isLoading, navigate]);

  if (isLoading) {
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

  const handleAddFeature = () => {
    setEditingFeature(undefined);
    setIsDrawerOpen(true);
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature);
    setIsDrawerOpen(true);
  };

  const handleSaveFeature = async (featureData: Omit<Feature, 'id'>) => {
    let updatedFeatures;
    
    if (editingFeature) {
      // Update existing feature
      updatedFeatures = features.map(f => 
        f.id === editingFeature.id 
          ? { ...f, ...featureData }
          : f
      );
    } else {
      // Add new feature
      const newFeature: Feature = {
        id: Date.now().toString(),
        ...featureData,
      };
      updatedFeatures = [...features, newFeature];
    }

    await updateProject(project.id, { features: updatedFeatures });
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      const updatedFeatures = features.filter(f => f.id !== featureId);
      await updateProject(project.id, { features: updatedFeatures });
    }
  };

  const handleRerunFeatures = async () => {
    if (!project.idea || !project.competitors) {
      return;
    }
    
    const selectedGap = project.market_analysis?.marketGaps?.[project.selected_gap_index || 0];
    const positioning = selectedGap?.positioningSuggestion || '';
    await rerunFeatureGeneration(project.idea, project.competitors, positioning);
  };

  return (
    <PageLayout>
      <div className="min-h-screen">
        <Helmet>
          <title>Features - {project.title} | Mogulate</title>
        </Helmet>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <FeaturesPageHeader
              project={project}
              onAddFeature={handleAddFeature}
              onRerun={handleRerunFeatures}
              isRerunning={isRerunning}
            />

            {/* Content */}
            {features.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">No features yet</h2>
                  <p className="text-gray-600 mb-6">
                    Start by adding your first feature to track development progress for this project.
                  </p>
                  <Button onClick={handleAddFeature} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Feature
                  </Button>
                </div>
              </div>
            ) : (
              // Features Grid
              <FeaturesGrid
                features={features}
                onEditFeature={handleEditFeature}
                onDeleteFeature={handleDeleteFeature}
              />
            )}
          </div>
        </div>

        <FeatureDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onSave={handleSaveFeature}
          feature={editingFeature}
        />
      </div>
    </PageLayout>
  );
};

export default FeaturesPage;
