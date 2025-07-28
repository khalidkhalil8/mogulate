
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
      
      <div className="mobile-padding py-4 md:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="content-spacing">
            {/* Standardized Header */}
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">{title}</h1>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>
            </div>
            
            {/* Content */}
            <div className="form-spacing">
              {children}
            </div>
            
            {/* Standardized Navigation */}
            {showNavigation && (onBack || onNext) && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 md:pt-8">
                {onBack ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex items-center justify-center gap-2 mobile-button order-2 sm:order-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft size={16} />
                    <span>{backLabel}</span>
                  </Button>
                ) : (
                  <div className="hidden sm:block" />
                )}
                
                {onNext && (
                  <Button
                    onClick={onNext}
                    disabled={!canProceed || isLoading}
                    className="gradient-bg border-none hover:opacity-90 button-transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mobile-button order-1 sm:order-2"
                  >
                    <span>{isLoading ? 'Loading...' : nextLabel}</span>
                    {!isLoading && <ArrowRight size={16} />}
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
