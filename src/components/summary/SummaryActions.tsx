
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/sonner';
import { IdeaData } from '@/lib/types';

interface SummaryActionsProps {
  data: IdeaData;
  onSaveProject: () => Promise<void>;
  projectTitle: string;
}

const SummaryActions: React.FC<SummaryActionsProps> = ({ data, onSaveProject, projectTitle }) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      console.log('SummaryActions: Saving project with data:', {
        title: projectTitle,
        idea: data.idea ? 'present' : 'empty',
        competitors: data.competitors.length,
        features: data.features.length,
        validationPlan: data.validationPlan.length,
        hasMarketAnalysis: !!data.marketGapScoringAnalysis,
      });

      await onSaveProject();
      
      toast.success('Project saved successfully! 🎉');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('SummaryActions: Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex justify-center pt-4">
      <Button 
        onClick={handleSaveProject}
        disabled={isSaving}
        className="gradient-bg border-none hover:opacity-90 button-transition px-8 py-3"
      >
        {isSaving ? 'Saving...' : 'Save Project'}
      </Button>
    </div>
  );
};

export default SummaryActions;
