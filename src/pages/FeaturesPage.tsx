
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import LoadingState from '@/components/ui/LoadingState';
import FeatureDrawer from '@/components/features/FeatureDrawer';
import FeaturesPageHeader from '@/components/features/FeaturesPageHeader';
import FeaturesEmptyState from '@/components/features/FeaturesEmptyState';
import FeaturesGrid from '@/components/features/FeaturesGrid';
import PageLayout from '@/components/layout/PageLayout';
import { Feature } from '@/lib/types';

const FeaturesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading, updateProject } = useProjects();
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
    return null;
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
    const updatedFeatures = features.filter(f => f.id !== featureId);
    await updateProject(project.id, { features: updatedFeatures });
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
            />

            {features.length === 0 ? (
              <FeaturesEmptyState onAddFeature={handleAddFeature} />
            ) : (
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
