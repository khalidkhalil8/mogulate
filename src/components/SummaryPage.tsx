
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import IdeaSummaryCard from './summary/IdeaSummaryCard';
import CompetitorsSummaryCard from './summary/CompetitorsSummaryCard';
import MarketGapsSummaryCard from './summary/MarketGapsSummaryCard';
import FeaturesSummaryCard from './summary/FeaturesSummaryCard';
import ValidationPlanEditableCard from './summary/ValidationPlanEditableCard';
import SummaryActions from './summary/SummaryActions';
import SetupNavigation from './setup/SetupNavigation';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';
import { supabase } from '@/integrations/supabase/client';

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  // Selection state for features and validation steps
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedValidationSteps, setSelectedValidationSteps] = useState<string[]>([]);
  
  const {
    existingProject,
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
  } = useProjectData();

  const {
    handleSaveProject: originalHandleSaveProject,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  // Initialize selections when ideaData changes
  useEffect(() => {
    // Select all features by default
    if (ideaData.features.length > 0) {
      setSelectedFeatures(ideaData.features.map(f => f.id));
    }
    
    // Select all validation steps by default
    if (ideaData.validationPlan.length > 0) {
      setSelectedValidationSteps(ideaData.validationPlan.map((_, index) => index.toString()));
    }
  }, [ideaData.features, ideaData.validationPlan]);

  // Handle feature selection toggle
  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Handle validation step selection toggle
  const handleValidationStepToggle = (stepIndex: number) => {
    const stepId = stepIndex.toString();
    setSelectedValidationSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  // Custom save handler that saves selected items to normalized tables
  const handleSaveProject = async () => {
    if (!projectId) return;

    try {
      // Save features to normalized table
      const selectedFeaturesData = ideaData.features.filter(feature => 
        selectedFeatures.includes(feature.id)
      );

      // Clear existing features and add selected ones
      const { error: deleteError } = await supabase
        .from('project_features')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        console.error('Error clearing features:', deleteError);
        throw deleteError;
      }

      // Insert selected features
      if (selectedFeaturesData.length > 0) {
        const { error: insertFeaturesError } = await supabase
          .from('project_features')
          .insert(
            selectedFeaturesData.map(feature => ({
              project_id: projectId,
              title: feature.title,
              description: feature.description,
              status: feature.status,
              priority: feature.priority,
              is_ai_generated: true
            }))
          );

        if (insertFeaturesError) {
          console.error('Error inserting features:', insertFeaturesError);
          throw insertFeaturesError;
        }
      }

      // Save validation steps to normalized table
      const selectedValidationData = ideaData.validationPlan.filter((_, index) => 
        selectedValidationSteps.includes(index.toString())
      );

      // Clear existing validation steps and add selected ones
      const { error: deleteValidationError } = await supabase
        .from('project_validation_steps')
        .delete()
        .eq('project_id', projectId);

      if (deleteValidationError) {
        console.error('Error clearing validation steps:', deleteValidationError);
        throw deleteValidationError;
      }

      // Insert selected validation steps
      if (selectedValidationData.length > 0) {
        const { error: insertValidationError } = await supabase
          .from('project_validation_steps')
          .insert(
            selectedValidationData.map(step => ({
              project_id: projectId,
              title: step.title,
              goal: step.goal,
              method: step.method,
              priority: step.priority,
              is_done: false,
              is_ai_generated: true
            }))
          );

        if (insertValidationError) {
          console.error('Error inserting validation steps:', insertValidationError);
          throw insertValidationError;
        }
      }

      // Create filtered market analysis with only selected gap
      let filteredMarketAnalysis = ideaData.marketGapScoringAnalysis;
      if (selectedGapIndex !== undefined && ideaData.marketGapScoringAnalysis?.marketGaps) {
        const selectedGap = ideaData.marketGapScoringAnalysis.marketGaps[selectedGapIndex];
        filteredMarketAnalysis = {
          ...ideaData.marketGapScoringAnalysis,
          marketGaps: [selectedGap]
        };
      }

      // Create filtered idea data with only selected items for JSON storage
      const filteredIdeaData = {
        ...ideaData,
        features: selectedFeaturesData,
        validationPlan: selectedValidationData,
        marketGapScoringAnalysis: filteredMarketAnalysis,
      };

      // Update ideaData with filtered data permanently for saving
      setIdeaData(filteredIdeaData);
      
      // Call the original save handler which will use the updated ideaData
      await originalHandleSaveProject();
    } catch (error) {
      console.error('Error in handleSaveProject:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-center">Summary</h1>
            <p className="text-gray-600 text-center">
              Here is everything we've discovered. Now it is time to grow your project.
            </p>
          </div>
          
          <div className="space-y-8">
            <IdeaSummaryCard idea={ideaData.idea} />
            <CompetitorsSummaryCard competitors={ideaData.competitors} />
            <MarketGapsSummaryCard 
              marketGaps={ideaData.marketGaps} 
              marketGapAnalysis={ideaData.marketGapAnalysis}
              marketGapScoringAnalysis={ideaData.marketGapScoringAnalysis}
              selectedGapIndex={selectedGapIndex}
            />
            <FeaturesSummaryCard 
              features={ideaData.features}
              selectedFeatures={selectedFeatures}
              onFeatureToggle={handleFeatureToggle}
            />
            <ValidationPlanEditableCard 
              validationPlan={ideaData.validationPlan}
              selectedSteps={selectedValidationSteps}
              onStepToggle={handleValidationStepToggle}
            />
            
            <div className="flex justify-between items-center pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/validation-plan')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </Button>
              
              <SummaryActions 
                data={ideaData} 
                onSaveProject={handleSaveProject}
                projectTitle={projectTitle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
