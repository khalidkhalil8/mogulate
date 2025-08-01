import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useFeedbackEntries } from '@/hooks/useFeedbackEntries';
import FeedbackDrawer from '@/components/feedback/FeedbackDrawer';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

interface EditableFeedbackWidgetProps {
  projectId: string;
}

const EditableFeedbackWidget: React.FC<EditableFeedbackWidgetProps> = ({ projectId }) => {
  const { feedbackEntries, isLoading, createFeedbackEntry, updateFeedbackEntry, deleteFeedbackEntry } = useFeedbackEntries(projectId);
  const [drawerState, setDrawerState] = useState<{ isOpen: boolean; entryId?: string; mode: 'view' | 'edit' | 'add' }>({ 
    isOpen: false, 
    mode: 'add' 
  });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; entryId?: string; title?: string }>({ isOpen: false });

  const handleDeleteFeedback = async () => {
    if (!deleteDialog.entryId) return;
    await deleteFeedbackEntry(deleteDialog.entryId);
    setDeleteDialog({ isOpen: false });
  };

  const selectedEntry = drawerState.entryId 
    ? feedbackEntries.find(entry => entry.id === drawerState.entryId) 
    : undefined;

  const recentEntries = feedbackEntries.slice(0, 3);

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Feedback Tracking
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
              <Settings className="h-5 w-5" />
              Feedback Tracking ({feedbackEntries.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerState({ isOpen: true, mode: 'add' })}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {feedbackEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No feedback entries yet. Click "Add" to track your first user feedback.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Entries:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrawerState({ isOpen: true, mode: 'view' })}
                  className="text-xs"
                >
                  View All
                </Button>
              </div>
              
              {recentEntries.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {entry.feedback_source}
                      </Badge>
                      {entry.source_username && (
                        <span className="text-xs text-gray-500">@{entry.source_username}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDrawerState({ isOpen: true, mode: 'view', entryId: entry.id })}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDrawerState({ isOpen: true, mode: 'edit', entryId: entry.id })}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({ 
                          isOpen: true, 
                          entryId: entry.id, 
                          title: entry.feedback_summary 
                        })}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{entry.feedback_summary}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FeedbackDrawer
        isOpen={drawerState.isOpen}
        onOpenChange={(open) => setDrawerState(prev => ({ ...prev, isOpen: open }))}
        projectId={projectId}
        entry={selectedEntry || null}
        onSave={createFeedbackEntry}
        onUpdate={updateFeedbackEntry}
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Feedback Entry"
        description={`Are you sure you want to delete this feedback entry? This action cannot be undone.`}
        onConfirm={handleDeleteFeedback}
        onCancel={() => setDeleteDialog({ isOpen: false })}
        variant="destructive"
        confirmText="Delete"
      />
    </>
  );
};

export default EditableFeedbackWidget;