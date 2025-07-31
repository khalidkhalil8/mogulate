import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Feature } from '@/lib/types';

interface FeaturesSummaryCardProps {
  features: Feature[];
  onSelectionChange: (selectedFeatures: Feature[]) => void;
  initialSelectedFeatures?: Feature[];
}

const FeaturesSummaryCard: React.FC<FeaturesSummaryCardProps> = ({ 
  features, 
  onSelectionChange,
  initialSelectedFeatures = features 
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(initialSelectedFeatures.map(f => f.id))
  );

  const handleFeatureToggle = (featureId: string) => {
    const newSelection = new Set(selectedFeatures);
    if (newSelection.has(featureId)) {
      newSelection.delete(featureId);
    } else {
      newSelection.add(featureId);
    }
    setSelectedFeatures(newSelection);
    
    // Send back only selected features
    const selectedFeaturesList = features.filter(f => newSelection.has(f.id));
    onSelectionChange(selectedFeaturesList);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (features.length === 0) {
    return (
      <Card className="bg-green-50 border-green-100">
        <CardHeader>
          <CardTitle className="text-xl">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No features generated yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 border-green-100">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          Features ({selectedFeatures.size} of {features.length} selected)
          <Badge variant="outline" className="text-sm">
            Select features to include in your project
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.id} className="border-l-4 border-green-200 pl-4 py-3 bg-white rounded-r-md">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedFeatures.has(feature.id)}
                  onCheckedChange={() => handleFeatureToggle(feature.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">{feature.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                      {feature.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{feature.description}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Select the features you want to include in your final project. You can always add or modify features later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturesSummaryCard;