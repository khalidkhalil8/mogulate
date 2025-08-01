import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useProjectFeatures } from '@/hooks/useProjectFeatures';
import FeatureEditDialog from './FeatureEditDialog';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import type { Feature } from '@/lib/types';

interface EditableFeaturesWidgetProps {
  projectId: string;
  onRerun?: () => void;
  isRerunning?: boolean;
}

const EditableFeaturesWidget: React.FC<EditableFeaturesWidgetProps> = ({
  projectId,
  onRerun,
  isRerunning = false
}) => {
  const { features, isLoading, addFeature, updateFeature, removeFeature } = useProjectFeatures(projectId);
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; feature?: Feature }>({ isOpen: false });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; feature?: Feature }>({ isOpen: false });
  const [savingFeatureId, setSavingFeatureId] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Planned': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleQuickStatusUpdate = async (feature: Feature, newStatus: 'Planned' | 'In Progress' | 'Done') => {
    setSavingFeatureId(feature.id);
    await updateFeature(feature.id, { status: newStatus });
    setSavingFeatureId(null);
  };

  const handleSaveFeature = async (featureData: Feature | Omit<Feature, 'id'>) => {
    if ('id' in featureData) {
      return await updateFeature(featureData.id, featureData);
    } else {
      return await addFeature(featureData);
    }
  };

  const handleDeleteFeature = async () => {
    if (!deleteDialog.feature) return;
    const success = await removeFeature(deleteDialog.feature.id);
    if (success) {
      setDeleteDialog({ isOpen: false });
    }
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5" />
              Features ({features.length})
            </CardTitle>
            <div className="flex gap-2">
              {onRerun && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRerun}
                  disabled={isRerunning}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Rerun
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialog({ isOpen: true })}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {features.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No features yet. Click "Add" to create your first feature.
            </p>
          ) : (
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{feature.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityColor(feature.priority)}`}>
                            {feature.priority}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditDialog({ isOpen: true, feature })}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ isOpen: true, feature })}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {feature.description && (
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Status:</span>
                        <Select
                          value={feature.status}
                          onValueChange={(value: 'Planned' | 'In Progress' | 'Done') => 
                            handleQuickStatusUpdate(feature, value)
                          }
                          disabled={savingFeatureId === feature.id}
                        >
                          <SelectTrigger className="w-28 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        {savingFeatureId === feature.id && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FeatureEditDialog
        isOpen={editDialog.isOpen}
        onOpenChange={(open) => setEditDialog({ isOpen: open })}
        onSave={handleSaveFeature}
        feature={editDialog.feature}
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Feature"
        description={`Are you sure you want to delete "${deleteDialog.feature?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteFeature}
        onCancel={() => setDeleteDialog({ isOpen: false })}
        variant="destructive"
        confirmText="Delete"
      />
    </>
  );
};

export default EditableFeaturesWidget;