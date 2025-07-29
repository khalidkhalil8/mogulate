
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
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="content-spacing">
          {/* Consistent Header Layout */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Content */}
          <div className="form-spacing">
            {children}
          </div>
          
          {/* Standardized Navigation */}
          {showNavigation && (onBack || onNext) && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-12">
              {onBack ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 px-8 py-3 text-lg"
                  disabled={isLoading}
                >
                  <ArrowLeft size={20} />
                  <span>{backLabel}</span>
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}
              
              {onNext && (
                <Button
                  onClick={onNext}
                  disabled={!canProceed || isLoading}
                  className="px-8 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <span>{isLoading ? 'Loading...' : nextLabel}</span>
                  {!isLoading && <ArrowRight size={20} />}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPageLayout;
