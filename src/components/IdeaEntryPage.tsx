
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import SetupNavigation from './setup/SetupNavigation';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';

const IdeaEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const {
    existingProject,
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
  } = useProjectData();

  const {
    handleIdeaSubmit,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  const [localTitle, setLocalTitle] = useState('');
  const [localIdea, setLocalIdea] = useState('');
  
  // Sync local state with loaded project data
  useEffect(() => {
    console.log('IdeaEntryPage: Syncing with project data', {
      projectTitle,
      ideaDataIdea: ideaData.idea,
      existingProjectId: existingProject?.id
    });
    
    if (projectTitle && projectTitle !== localTitle) {
      setLocalTitle(projectTitle);
    }
    
    if (ideaData.idea && ideaData.idea !== localIdea) {
      setLocalIdea(ideaData.idea);
    }
  }, [projectTitle, ideaData.idea, existingProject]);
  
  // Also sync when component first mounts
  useEffect(() => {
    if (!localTitle && projectTitle) {
      setLocalTitle(projectTitle);
    }
    if (!localIdea && ideaData.idea) {
      setLocalIdea(ideaData.idea);
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localTitle.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    
    if (!localIdea.trim()) {
      toast.error('Please describe your project');
      return;
    }

    console.log('IdeaEntryPage: Submitting idea', {
      title: localTitle,
      ideaLength: localIdea.length
    });

    try {
      // Submit the idea with title
      await handleIdeaSubmit(localIdea, localTitle);
      
      // Navigate to competitors page
      const nextUrl = projectId ? `/competitors?projectId=${projectId}` : '/competitors';
      navigate(nextUrl);
    } catch (error) {
      console.error('Error submitting idea:', error);
      toast.error('Failed to save your idea. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Start Your Project</h1>
            <p className="text-gray-600">Give your project a name and provide a description.</p>
            {existingProject && (
              <p className="text-sm text-green-600 mt-2">
                Editing existing project: {existingProject.title}
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectTitle" className="text-sm font-medium">
                  Project Title
                </Label>
                <Input
                  id="projectTitle"
                  placeholder="Enter your project title"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="idea" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="idea"
                  placeholder="An AI-powered fitness app that analyzes the users form through the phone camera"
                  value={localIdea}
                  onChange={(e) => setLocalIdea(e.target.value)}
                  className="min-h-[120px] resize-y w-full"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="flex items-center gap-2"
                disabled={!localTitle.trim() || !localIdea.trim()}
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdeaEntryPage;
