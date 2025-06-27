
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FeaturePageNavigationProps {
  onBack: () => void;
  onNext: () => void;
  onAskAI: () => void;
}

const FeaturePageNavigation: React.FC<FeaturePageNavigationProps> = ({
  onBack,
  onNext,
  onAskAI
}) => {
  return (
    <div className="flex justify-between pt-6">
      <div className="flex gap-4">
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
          type="button"
          variant="secondary"
          onClick={onAskAI}
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
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>Ask AI</span>
        </Button>
      </div>
      
      <Button 
        type="submit" 
        className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
      >
        <span>Next</span>
        <ArrowRight size={18} />
      </Button>
    </div>
  );
};

export default FeaturePageNavigation;
