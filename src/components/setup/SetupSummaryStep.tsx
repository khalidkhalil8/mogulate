
import React from 'react';
import SetupPageLayout from './SetupPageLayout';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SetupSummaryStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext?: () => void;
  onBack?: () => void;
  onSave?: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

const SetupSummaryStep: React.FC<SetupSummaryStepProps> = ({
  setupData,
  onBack,
  onSave,
  canProceed,
  isLoading,
}) => {
  return (
    <SetupPageLayout
      title="Project Summary"
      description="Review your project setup and save to your dashboard"
      onBack={onBack}
      showNavigation={false}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Project Overview */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Title:</span>
              <p className="text-gray-900 mt-1">{setupData.title}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Description:</span>
              <p className="text-gray-900 mt-1">{setupData.description}</p>
            </div>
          </div>
        </div>

        {/* Competitors */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Competitors ({setupData.competitors.length})
          </h3>
          {setupData.competitors.length > 0 ? (
            <div className="space-y-3">
              {setupData.competitors.map((competitor, index) => (
                <div key={competitor.id} className="flex items-start space-x-3">
                  <span className="text-sm text-gray-500 mt-1">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{competitor.name}</p>
                    <p className="text-sm text-gray-600">{competitor.description}</p>
                    <p className="text-sm text-blue-600">{competitor.website}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No competitors added</p>
          )}
        </div>

        {/* Market Analysis */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Market Analysis</h3>
          {setupData.marketAnalysis ? (
            <div className="space-y-3">
              {setupData.marketAnalysis.marketGaps.map((gap, index) => (
                <div key={index} className="border-l-4 border-teal-500 pl-4">
                  <p className="font-medium text-gray-900">{gap.gap}</p>
                  <p className="text-sm text-gray-600 mt-1">{gap.positioningSuggestion}</p>
                  <p className="text-sm text-teal-600 mt-1">Score: {gap.score}/10</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No market analysis available</p>
          )}
        </div>

        {/* Features */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Features ({setupData.features.length})
          </h3>
          {setupData.features.length > 0 ? (
            <div className="space-y-3">
              {setupData.features.map((feature, index) => (
                <div key={feature.id} className="flex items-start space-x-3">
                  <span className="text-sm text-gray-500 mt-1">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        feature.priority === 'High' ? 'bg-red-100 text-red-800' :
                        feature.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {feature.priority}
                      </span>
                      <span className="text-xs text-gray-500">{feature.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No features added</p>
          )}
        </div>

        {/* Validation Plan */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Validation Plan ({setupData.validationPlan.length})
          </h3>
          {setupData.validationPlan.length > 0 ? (
            <div className="space-y-3">
              {setupData.validationPlan.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-sm text-gray-500 mt-1">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-gray-600">{step.goal}</p>
                    <p className="text-sm text-gray-500">Method: {step.method}</p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                      step.priority === 'High' ? 'bg-red-100 text-red-800' :
                      step.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {step.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No validation steps added</p>
          )}
        </div>

        {/* Save Action */}
        <div className="flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Back to Edit
          </Button>
          
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Project
              </>
            )}
          </Button>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default SetupSummaryStep;
