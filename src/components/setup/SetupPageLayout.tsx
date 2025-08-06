
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
      
      <div className="setup-content mobile-padding section-spacing">
        <div className="content-spacing">
          {/* Consistent Header Layout */}
          <div className="setup-header">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              {description}
            </p>
          </div>
          
          {/* Content */}
          <div className="form-spacing">
            {children}
          </div>
          
          {/* Standardized Navigation */}
          {showNavigation && (onBack || onNext) && (
            <div className="navigation-spacing button-spacing">
              {onBack ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="nav-button"
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
                  className="nav-button bg-primary text-primary-foreground hover:bg-primary/90"
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
