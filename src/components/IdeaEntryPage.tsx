
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import SetupNavigation from './setup/SetupNavigation';

interface IdeaEntryPageProps {
  initialIdea?: string;
  initialTitle?: string;
  onIdeaSubmit: (idea: string, title: string) => void;
}

const IdeaEntryPage: React.FC<IdeaEntryPageProps> = ({ 
  initialIdea = "", 
  initialTitle = "",
  onIdeaSubmit 
}) => {
  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [idea, setIdea] = useState(initialIdea);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectTitle.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    
    if (!idea.trim()) {
      toast.error('Please describe your idea');
      return;
    }

    // Submit the idea with title - no success toast here
    onIdeaSubmit(idea, projectTitle);
    navigate('/competitors');
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Start Your Project</h1>
            <p className="text-gray-600">Give your project a name and describe your idea. Don't worry — you can edit this later.</p>
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
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
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
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="min-h-[120px] resize-y w-full"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="flex items-center gap-2"
                disabled={!projectTitle.trim() || !idea.trim()}
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
