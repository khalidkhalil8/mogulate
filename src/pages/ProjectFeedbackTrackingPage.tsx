
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useFeedbackEntries, FeedbackEntry } from '@/hooks/useFeedbackEntries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowLeft, Edit, Trash2, AlertCircle, Home } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import PageLayout from '@/components/layout/PageLayout';
import FeedbackDrawer from '@/components/feedback/FeedbackDrawer';

const ProjectFeedbackTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { feedbackEntries, isLoading: feedbackLoading, createFeedbackEntry, updateFeedbackEntry, deleteFeedbackEntry } = useFeedbackEntries(id || '');
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FeedbackEntry | null>(null);
  
  const project = projects.find(p => p.id === id);
  
  if (projectsLoading || feedbackLoading) {
    return <LoadingState />;
  }
  
  if (!id || !project) {
    return (
      <PageLayout>
        <div className="min-h-screen">
          <Helmet>
            <title>Feedback Tracking - Project Not Found | Mogulate</title>
          </Helmet>
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Project Not Found</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {!id ? 'Invalid project ID provided.' : 'This project may have been deleted or you don\'t have access to it.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleAddFeedback = () => {
    setEditingEntry(null);
    setDrawerOpen(true);
  };

  const handleEditFeedback = (entry: FeedbackEntry) => {
    setEditingEntry(entry);
    setDrawerOpen(true);
  };

  const handleSaveFeedback = (entryData: Omit<FeedbackEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    createFeedbackEntry(entryData);
  };

  const handleUpdateFeedback = (entryId: string, updates: Partial<FeedbackEntry>) => {
    updateFeedbackEntry(entryId, updates);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <PageLayout>
      <div className="min-h-screen">
        <Helmet>
          <title>Feedback Tracking - {project.title} | Mogulate</title>
        </Helmet>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Feedback Tracking</h1>
                  <p className="text-gray-600">Track and manage user feedback for {project.title}</p>
                </div>
                <Button onClick={handleAddFeedback} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Feedback
                </Button>
              </div>
            </div>

            {/* Content */}
            {feedbackEntries.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">No feedback yet</h2>
                  <p className="text-gray-600 mb-6">
                    Start tracking feedback from your users to better understand their needs and improve your product.
                  </p>
                  <Button onClick={handleAddFeedback} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Feedback
                  </Button>
                </div>
              </div>
            ) : (
              // Feedback List
              <div className="space-y-4">
                {feedbackEntries.map((entry) => (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(entry.date)}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {entry.feedback_source}
                            </span>
                            {entry.source_username && (
                              <span className="text-sm text-gray-600">
                                {entry.source_username}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 leading-relaxed">
                            {entry.feedback_summary}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFeedback(entry)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFeedbackEntry(entry.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <FeedbackDrawer
          isOpen={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSave={handleSaveFeedback}
          onUpdate={handleUpdateFeedback}
          entry={editingEntry}
          projectId={project.id}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectFeedbackTrackingPage;
