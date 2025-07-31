import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Feature } from '@/lib/types';

interface FeaturesSummaryCardProps {
  features: Feature[];
  selectedFeatures: string[];
  onFeatureToggle: (featureId: string) => void;
}

const FeaturesSummaryCard: React.FC<FeaturesSummaryCardProps> = ({ 
  features, 
  selectedFeatures, 
  onFeatureToggle 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (features.length === 0) {
    return (
      <Card className="bg-purple-50 border-purple-100">
        <CardHeader>
          <CardTitle className="text-xl">Features to Build</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No features generated yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-purple-50 border-purple-100">
      <CardHeader>
        <CardTitle className="text-xl">Features to Build</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Select the features you want to include in your project plan
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.id} className="border border-purple-200 rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedFeatures.includes(feature.id)}
                  onCheckedChange={() => onFeatureToggle(feature.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900">{feature.title}</h4>
                    <Badge className={`text-xs ${getPriorityColor(feature.priority)}`}>
                      {feature.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedFeatures.length > 0 && (
          <div className="mt-4 p-3 bg-purple-100 rounded-lg">
            <p className="text-sm text-purple-800">
              {selectedFeatures.length} of {features.length} features selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeaturesSummaryCard;