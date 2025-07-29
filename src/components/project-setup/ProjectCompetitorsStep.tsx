
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import SetupPageLayout from '@/components/setup/SetupPageLayout';
import CompetitorsList from '@/components/competitors/CompetitorsList';
import { fetchCompetitors } from '@/lib/api/competitors';
import { toast } from '@/components/ui/sonner';
import type { Competitor } from '@/lib/types';

interface ProjectCompetitorsStepProps {
  projectData: any;
  updateProjectData: (data: any) => void;
}

const ProjectCompetitorsStep: React.FC<ProjectCompetitorsStepProps> = ({
  projectData,
  updateProjectData
}) => {
  const [competitors, setCompetitors] = useState<Competitor[]>(projectData.competitors || []);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Save to localStorage for persistence
    localStorage.setItem('projectSetupData', JSON.stringify({
      ...projectData,
      competitors
    }));
  }, [competitors, projectData]);

  const handleFindCompetitors = async () => {
    if (!projectData.idea) {
      toast.error('Please complete the description step first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchCompetitors(projectData.idea);
      if (result.competitors && result.competitors.length > 0) {
        setCompetitors(result.competitors);
        toast.success(`Found ${result.competitors.length} competitors!`);
      } else {
        toast.error('No competitors found. Try adding them manually.');
      }
    } catch (error) {
      toast.error('Failed to find competitors.');
    } finally {
      setIsLoading(false);
    }
  };

  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: '',
      website: '',
      description: '',
      isAiGenerated: false
    };
    setCompetitors([...competitors, newCompetitor]);
  };

  const updateCompetitor = (id: string, field: keyof Competitor, value: string) => {
    setCompetitors(competitors.map(comp =>
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(comp => comp.id !== id));
  };

  const handleNext = () => {
    updateProjectData({ competitors });
    navigate('/project-setup/market-analysis');
  };

  const handleBack = () => {
    updateProjectData({ competitors });
    navigate('/project-setup/description');
  };

  const canProceed = competitors.length > 0;

  if (competitors.length === 0) {
    return (
      <SetupPageLayout
        title="Discover Your Competitors"
        description="Understanding your competition helps identify gaps and opportunities for your product."
        showNavigation={false}
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleFindCompetitors} 
              disabled={isLoading}
              className="gradient-bg border-none hover:opacity-90 button-transition"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Finding Competitors...' : 'Find Competitors with AI'}
            </Button>
            <Button 
              variant="outline"
              onClick={addCompetitor}
            >
              Add Competitor Manually
            </Button>
          </div>
          
          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <div />
          </div>
        </div>
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Review Your Competitors"
      description="Edit the competitors we found or add more to get a complete picture."
      onNext={handleNext}
      onBack={handleBack}
      canProceed={canProceed}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Competitors ({competitors.length})</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleFindCompetitors} 
              disabled={isLoading}
              size="sm"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Finding...' : 'Find More'}
            </Button>
            <Button 
              variant="outline"
              onClick={addCompetitor}
              size="sm"
            >
              Add Manually
            </Button>
          </div>
        </div>

        <CompetitorsList
          competitors={competitors}
          onAddCompetitor={addCompetitor}
          onUpdateCompetitor={updateCompetitor}
          onRemoveCompetitor={removeCompetitor}
        />
      </div>
    </SetupPageLayout>
  );
};

export default ProjectCompetitorsStep;
