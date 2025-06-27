
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeatureDrawer from '@/components/features/FeatureDrawer';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Features - {project.title} | Mogulate</title>
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
                <h1 className="text-3xl font-bold mb-2">Features</h1>
                <p className="text-gray-600">
                  Manage features for {project.title}
                </p>
              </div>
              <Button onClick={handleAddFeature} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Feature
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          {features.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No features yet</h2>
                <p className="text-gray-600 mb-6">
                  Start by adding your first feature to track development progress
                </p>
                <Button onClick={handleAddFeature} size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Feature
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {feature.title}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFeature(feature)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeature(feature.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {feature.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {feature.description}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getStatusColor(feature.status)}>
                        {feature.status}
                      </Badge>
                      <Badge className={getPriorityColor(feature.priority)}>
                        {feature.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
  );
};

export default FeaturesPage;
