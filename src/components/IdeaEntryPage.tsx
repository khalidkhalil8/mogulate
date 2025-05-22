
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from './Header';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
      navigate('/competitors');
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
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Home</span>
                </Button>
                
                <Button 
                  type="submit" 
                  className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
                  disabled={!idea.trim()}
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
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
