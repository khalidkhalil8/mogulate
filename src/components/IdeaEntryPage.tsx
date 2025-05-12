
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from './Header';

interface IdeaEntryPageProps {
  initialIdea?: string;
  onIdeaSubmit: (idea: string) => void;
}

const IdeaEntryPage: React.FC<IdeaEntryPageProps> = ({ 
  initialIdea = "", 
  onIdeaSubmit 
}) => {
  const [idea, setIdea] = useState(initialIdea);
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onIdeaSubmit(idea);
      navigate('/idea/competitors');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container-width max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Enter Your Idea
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label 
                  htmlFor="idea" 
                  className="block text-lg font-medium text-charcoal"
                >
                  Describe your idea below
                </label>
                <Textarea
                  id="idea"
                  placeholder="An AI-powered fitness app that analyzes the users form through the phone camera"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="min-h-[150px] resize-y"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="px-6 py-2 gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
                  disabled={!idea.trim()}
                >
                  <span>Next</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IdeaEntryPage;
