
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Header from './Header';
import type { Competitor } from '@/lib/types';
import LoadingState from './ui/LoadingState';
import { findCompetitors } from '@/lib/api';
import CompetitorsList from './competitors/CompetitorsList';
import FindCompetitorsDialog from './competitors/FindCompetitorsDialog';

interface CompetitorDiscoveryPageProps {
  idea: string;
  initialCompetitors?: Competitor[];
  onCompetitorsSubmit: (competitors: Competitor[]) => void;
}

const CompetitorDiscoveryPage: React.FC<CompetitorDiscoveryPageProps> = ({
  idea,
  initialCompetitors = [],
  onCompetitorsSubmit
}) => {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      id: `manual-${Math.random().toString(36).substring(2, 9)}`,
      name: '',
      website: '',
      description: '',
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
  
  const handleFindCompetitors = async () => {
    setIsDialogOpen(false);
    setIsLoading(true);
    try {
      const aiCompetitors = await findCompetitors(idea);
      if (aiCompetitors.length) {
        // Filter out any AI competitors that might have the same name as manually entered ones
        const existingNames = new Set(competitors.map(c => c.name.toLowerCase()));
        const newCompetitors = aiCompetitors.filter(c => !existingNames.has(c.name.toLowerCase()));
        
        setCompetitors([...competitors, ...newCompetitors]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out incomplete competitors
    const validCompetitors = competitors.filter(
      comp => comp.name.trim() && comp.website.trim()
    );
    onCompetitorsSubmit(validCompetitors);
    navigate('/market-gaps');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container-width max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Finding Competition
            </h1>
            
            {isLoading ? (
              <LoadingState message="Hang tight - our AI is finding competitors" />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <CompetitorsList 
                  competitors={competitors}
                  onAddCompetitor={addCompetitor}
                  onUpdateCompetitor={updateCompetitor}
                  onRemoveCompetitor={removeCompetitor}
                />
                
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Find Competitors</span>
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
                  >
                    <span>Next</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      
      <FindCompetitorsDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onFindCompetitors={handleFindCompetitors}
      />
    </div>
  );
};

export default CompetitorDiscoveryPage;
