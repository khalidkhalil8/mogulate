import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from 'lucide-react';
import { useFeedbackEntries } from '@/hooks/useFeedbackEntries';

interface EditableFeedbackWidgetProps {
  projectId: string;
}

const EditableFeedbackWidget: React.FC<EditableFeedbackWidgetProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const { feedbackEntries, isLoading } = useFeedbackEntries(projectId);

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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          Feedback Tracking ({feedbackEntries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {feedbackEntries.length === 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant="secondary">No Feedback</Badge>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Entries:</span>
                <Badge variant="outline">{feedbackEntries.length}</Badge>
              </div>
              {feedbackEntries.length > 0 && (
                <p className="text-sm text-gray-600">
                  {feedbackEntries.length} feedback entr{feedbackEntries.length !== 1 ? 'ies' : 'y'} tracked
                </p>
              )}
            </>
          )}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/project/${projectId}/feedback`)}
              className="flex-1"
            >
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableFeedbackWidget;