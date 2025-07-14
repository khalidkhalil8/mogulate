
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import SetupNavigation from './setup/SetupNavigation';
import { fetchCompetitors } from '@/lib/api/competitors';
import CompetitorsList from './competitors/CompetitorsList';
import CompetitorWelcomeState from './competitors/CompetitorWelcomeState';
import FindCompetitorsDialog from './competitors/FindCompetitorsDialog';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';
import type { Competitor } from '@/lib/types';

const CompetitorDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
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
    handleCompetitorsSubmit,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Load existing competitors when component mounts or ideaData changes
  useEffect(() => {
    console.log('CompetitorDiscoveryPage: Loading existing competitors', {
      competitorsCount: ideaData.competitors?.length || 0,
      hasIdea: !!ideaData.idea
    });
    
    if (ideaData.competitors && ideaData.competitors.length > 0) {
      setCompetitors(ideaData.competitors);
      setHasGenerated(true);
    }
  }, [ideaData.competitors]);

  const handleFindCompetitors = async () => {
    if (!ideaData.idea) {
      toast.error('Please enter your idea first');
      return;
    }

    console.log('CompetitorDiscoveryPage: Starting competitor discovery for idea:', ideaData.idea.substring(0, 100) + '...');
    
    setIsLoading(true);
    setShowDialog(false);
    
    try {
      const result = await fetchCompetitors(ideaData.idea);
      
      if (result.competitors && result.competitors.length > 0) {
        console.log('CompetitorDiscoveryPage: Successfully found competitors:', result.competitors.length);
        setCompetitors(result.competitors);
        setHasGenerated(true);
        toast.success(`Found ${result.competitors.length} competitors!`);
      } else {
        console.warn('CompetitorDiscoveryPage: No competitors found');
        toast.error('No competitors found. Please try with a different description or add competitors manually.');
      }
    } catch (error) {
      console.error('CompetitorDiscoveryPage: Error during competitor discovery:', error);
      toast.error('Failed to find competitors. Please try again or add them manually.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('CompetitorDiscoveryPage: Submitting competitors:', competitors.length);
    
    try {
      await handleCompetitorsSubmit(competitors);
      
      const nextUrl = projectId ? `/market-gaps?projectId=${projectId}` : '/market-gaps';
      navigate(nextUrl);
    } catch (error) {
      console.error('CompetitorDiscoveryPage: Error submitting competitors:', error);
      toast.error('Failed to save competitors. Please try again.');
    }
  };

  const handleBack = async () => {
    console.log('CompetitorDiscoveryPage: Going back to idea page');
    
    try {
      // Save current competitors before going back
      await handleCompetitorsSubmit(competitors);
      
      const backUrl = projectId ? `/idea?projectId=${projectId}` : '/idea';
      navigate(backUrl);
    } catch (error) {
      console.error('CompetitorDiscoveryPage: Error saving competitors on back:', error);
      // Still allow navigation even if save fails
      const backUrl = projectId ? `/idea?projectId=${projectId}` : '/idea';
      navigate(backUrl);
    }
  };

  const canProceed = competitors.length > 0;
  const showWelcomeState = !hasGenerated && competitors.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {showWelcomeState ? (
            <CompetitorWelcomeState
              onFindCompetitors={() => setShowDialog(true)}
              onAddManually={addCompetitor}
              isLoading={isLoading}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Your Competitors</h1>
                    <p className="text-gray-600">
                      {hasGenerated 
                        ? "Review and edit the competitors we found, or add your own."
                        : "Add competitors to understand your market landscape."
                      }
                    </p>
                    {!ideaData.idea && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ No project idea found. Please go back and enter your idea first.
                      </p>
                    )}
                  </div>
                  
                  {competitors.length > 0 && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowDialog(true)}
                      disabled={isLoading || !ideaData.idea}
                    >
                      {isLoading ? 'Finding...' : 'Find More Competitors'}
                    </Button>
                  )}
                </div>
              </div>

              <CompetitorsList
                competitors={competitors}
                onAddCompetitor={addCompetitor}
                onUpdateCompetitor={updateCompetitor}
                onRemoveCompetitor={removeCompetitor}
              />

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </Button>
                
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                  disabled={!canProceed}
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <FindCompetitorsDialog
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        onFindCompetitors={handleFindCompetitors}
      />
    </div>
  );
};

export default CompetitorDiscoveryPage;
