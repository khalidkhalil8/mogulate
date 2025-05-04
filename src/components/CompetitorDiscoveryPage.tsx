
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from './Header';
import type { Competitor } from '@/lib/types';
import LoadingState from './ui/LoadingState';
import { findCompetitors } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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
      comp => comp.name.trim() && comp.website.trim() && comp.description.trim()
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
                <div className="space-y-6">
                  {competitors.map((competitor, index) => (
                    <div 
                      key={competitor.id} 
                      className={`p-4 border rounded-lg ${competitor.isAiGenerated ? 'border-teal-200 bg-teal-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">
                          {competitor.isAiGenerated ? 'AI-Found Competitor' : `Competitor ${index + 1}`}
                        </h3>
                        {!competitor.isAiGenerated && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeCompetitor(competitor.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`name-${competitor.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <Input
                            id={`name-${competitor.id}`}
                            value={competitor.name}
                            onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                            placeholder="Competitor Name"
                            readOnly={competitor.isAiGenerated}
                            className={competitor.isAiGenerated ? "bg-gray-50" : ""}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`website-${competitor.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                          </label>
                          <Input
                            id={`website-${competitor.id}`}
                            value={competitor.website}
                            onChange={(e) => updateCompetitor(competitor.id, 'website', e.target.value)}
                            placeholder="example.com"
                            readOnly={competitor.isAiGenerated}
                            className={competitor.isAiGenerated ? "bg-gray-50" : ""}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`description-${competitor.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <Textarea
                            id={`description-${competitor.id}`}
                            value={competitor.description}
                            onChange={(e) => updateCompetitor(competitor.id, 'description', e.target.value)}
                            placeholder="Brief description of the product or service"
                            readOnly={competitor.isAiGenerated}
                            className={competitor.isAiGenerated ? "bg-gray-50 min-h-[80px]" : "min-h-[80px]"}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addCompetitor}
                    className="w-full py-6 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
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
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add More</span>
                  </Button>
                </div>
                
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finding Competition</DialogTitle>
            <DialogDescription>
              Our AI will analyze your idea and find competition in your market. 
              Understanding existing solutions helps you identify gaps and opportunities 
              for your product.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleFindCompetitors}>
              Find competitors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompetitorDiscoveryPage;
