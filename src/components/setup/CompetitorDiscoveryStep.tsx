
import React, { useState, useEffect } from 'react';
import SetupPageLayout from './SetupPageLayout';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2 } from 'lucide-react';
import { fetchCompetitors } from '@/lib/api/competitors';
import { toast } from '@/components/ui/sonner';
import { Competitor } from '@/lib/types';
import CompetitorCard from '@/components/competitors/CompetitorCard';
import AddCompetitorForm from '@/components/competitors/AddCompetitorForm';

interface CompetitorDiscoveryStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  onBack?: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

const CompetitorDiscoveryStep: React.FC<CompetitorDiscoveryStepProps> = ({
  setupData,
  updateSetupData,
  onNext,
  onBack,
  canProceed,
  isLoading,
}) => {
  const [competitors, setCompetitors] = useState<Competitor[]>(setupData.competitors);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setCompetitors(setupData.competitors);
  }, [setupData.competitors]);

  const handleNext = () => {
    updateSetupData({ competitors });
    onNext();
  };

  const handleDiscoverCompetitors = async () => {
    if (!setupData.description.trim()) {
      toast.error('Please add a project description first');
      return;
    }

    setIsDiscovering(true);
    try {
      const { competitors: discoveredCompetitors } = await fetchCompetitors(setupData.description);
      
      if (discoveredCompetitors.length > 0) {
        const newCompetitors = [...competitors, ...discoveredCompetitors];
        setCompetitors(newCompetitors);
        toast.success(`Found ${discoveredCompetitors.length} competitors`);
      } else {
        toast.info('No competitors found. You can add them manually.');
      }
    } catch (error) {
      console.error('Error discovering competitors:', error);
      toast.error('Failed to discover competitors');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddCompetitor = (competitor: Competitor) => {
    const newCompetitors = [...competitors, competitor];
    setCompetitors(newCompetitors);
    setShowAddForm(false);
  };

  const handleUpdateCompetitor = (competitorId: string, updates: Partial<Competitor>) => {
    const updatedCompetitors = competitors.map(comp =>
      comp.id === competitorId ? { ...comp, ...updates } : comp
    );
    setCompetitors(updatedCompetitors);
  };

  const handleRemoveCompetitor = (competitorId: string) => {
    const updatedCompetitors = competitors.filter(comp => comp.id !== competitorId);
    setCompetitors(updatedCompetitors);
  };

  return (
    <SetupPageLayout
      title="Discover Your Competitors"
      description="Find and analyze your competition to understand the market landscape"
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue"
      canProceed={!isLoading}
      isLoading={isLoading}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleDiscoverCompetitors}
            disabled={isDiscovering || !setupData.description.trim()}
            className="flex items-center gap-2"
          >
            {isDiscovering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isDiscovering ? 'Discovering...' : 'Discover Competitors'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Manually
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Add Competitor</h3>
            <AddCompetitorForm
              onSave={handleAddCompetitor}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {competitors.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Competitors ({competitors.length})
            </h3>
            <div className="space-y-4">
              {competitors.map((competitor, index) => (
                <div key={competitor.id} className="w-full">
                  <CompetitorCard
                    competitor={competitor}
                    index={index}
                    onUpdate={(field, value) => handleUpdateCompetitor(competitor.id, { [field]: value })}
                    onRemove={() => handleRemoveCompetitor(competitor.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {competitors.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-2" />
              <p>No competitors added yet</p>
              <p className="text-sm">Use the buttons above to discover or add competitors</p>
            </div>
          </div>
        )}
      </div>
    </SetupPageLayout>
  );
};

export default CompetitorDiscoveryStep;
