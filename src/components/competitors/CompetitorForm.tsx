
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import CompetitorsList from './CompetitorsList';
import type { Competitor } from '@/lib/types';

interface CompetitorFormProps {
  competitors: Competitor[];
  hasGenerated: boolean;
  canProceed: boolean;
  onAddCompetitor: () => void;
  onUpdateCompetitor: (id: string, field: keyof Competitor, value: string) => void;
  onRemoveCompetitor: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const CompetitorForm: React.FC<CompetitorFormProps> = ({
  competitors,
  hasGenerated,
  canProceed,
  onAddCompetitor,
  onUpdateCompetitor,
  onRemoveCompetitor,
  onSubmit,
  onBack
}) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Competitors</h1>
        <p className="text-gray-600">
          {hasGenerated 
            ? "Review and edit the competitors we found, or add your own."
            : "Here are your competitors. You can add more or edit the existing ones."
          }
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-8">
        <CompetitorsList 
          competitors={competitors}
          onAddCompetitor={onAddCompetitor}
          onUpdateCompetitor={onUpdateCompetitor}
          onRemoveCompetitor={onRemoveCompetitor}
        />
        
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Button>
          
          <Button 
            type="submit" 
            className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
            disabled={!canProceed}
          >
            <span>Next</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </form>
    </>
  );
};

export default CompetitorForm;
