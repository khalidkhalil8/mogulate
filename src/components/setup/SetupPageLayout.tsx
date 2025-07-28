
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SetupNavigation from './SetupNavigation';

interface SetupPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  canProceed?: boolean;
  isLoading?: boolean;
  showNavigation?: boolean;
}

const SetupPageLayout: React.FC<SetupPageLayoutProps> = ({
  children,
  title,
  description,
  onBack,
  onNext,
  nextLabel = 'Next',
  backLabel = 'Back',
  canProceed = true,
  isLoading = false,
  showNavigation = true,
}) => {
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Standardized Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            
            {/* Content */}
            <div className="space-y-6">
              {children}
            </div>
            
            {/* Standardized Navigation */}
            {showNavigation && (onBack || onNext) && (
              <div className="flex justify-between pt-6">
                {onBack ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <ArrowLeft size={18} />
                    <span>{backLabel}</span>
                  </Button>
                ) : (
                  <div />
                )}
                
                {onNext && (
                  <Button
                    onClick={onNext}
                    disabled={!canProceed || isLoading}
                    className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isLoading ? 'Loading...' : nextLabel}</span>
                    <ArrowRight size={18} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPageLayout;
