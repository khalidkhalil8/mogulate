
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Feature } from '@/lib/types';

interface FeaturesGridProps {
  features: Feature[];
  onEditFeature: (feature: Feature) => void;
  onDeleteFeature: (featureId: string) => void;
}

const FeaturesGrid: React.FC<FeaturesGridProps> = ({
  features,
  onEditFeature,
  onDeleteFeature,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <Card key={feature.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg line-clamp-2">
                {feature.title}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditFeature(feature)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteFeature(feature.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {feature.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                {feature.description}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Badge className={getStatusColor(feature.status)}>
                {feature.status}
              </Badge>
              <Badge className={getPriorityColor(feature.priority)}>
                {feature.priority}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeaturesGrid;
