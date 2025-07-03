
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Plus, X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import SetupNavigation from './setup/SetupNavigation';

interface ValidationStep {
  id: string;
  title: string;
  description: string;
  tool: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface ValidationPlanPageProps {
  initialValidationPlan?: string;
  onValidationPlanSubmit: (validationPlan: string) => void;
}

const ValidationPlanPage: React.FC<ValidationPlanPageProps> = ({ 
  initialValidationPlan = "", 
  onValidationPlanSubmit 
}) => {
  const [steps, setSteps] = useState<ValidationStep[]>([
    {
      id: '1',
      title: '',
      description: '',
      tool: '',
      priority: 'Medium'
    }
  ]);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  
  // Parse initialValidationPlan and populate steps
  useEffect(() => {
    if (initialValidationPlan && initialValidationPlan.trim()) {
      try {
        const stepBlocks = initialValidationPlan.split('\n\n').filter(block => block.trim());
        const parsedSteps: ValidationStep[] = [];
        
        stepBlocks.forEach((block, index) => {
          const lines = block.split('\n');
          const titleLine = lines.find(line => line.startsWith('Step '));
          const descLine = lines.find(line => line.startsWith('Goal/Description: '));
          const toolLine = lines.find(line => line.startsWith('Tool/Method: '));
          const priorityLine = lines.find(line => line.startsWith('Priority: '));
          
          if (titleLine) {
            const title = titleLine.replace(/^Step \d+: /, '');
            const description = descLine ? descLine.replace('Goal/Description: ', '') : '';
            const tool = toolLine ? toolLine.replace('Tool/Method: ', '') : '';
            const priority = priorityLine ? priorityLine.replace('Priority: ', '') as 'High' | 'Medium' | 'Low' : 'Medium';
            
            parsedSteps.push({
              id: (index + 1).toString(),
              title,
              description,
              tool,
              priority
            });
          }
        });
        
        if (parsedSteps.length > 0) {
          setSteps(parsedSteps);
        }
      } catch (error) {
        console.error('Error parsing validation plan:', error);
      }
    }
  }, [initialValidationPlan]);
  
  const addStep = () => {
    const newStep: ValidationStep = {
      id: Date.now().toString(),
      title: '',
      description: '',
      tool: '',
      priority: 'Medium'
    };
    setSteps([...steps, newStep]);
  };
  
  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== id));
    }
  };
  
  const updateStep = (id: string, field: keyof ValidationStep, value: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiGeneratedSteps: ValidationStep[] = [
        {
          id: '1',
          title: 'Create Landing Page',
          description: 'Build a simple landing page to gauge initial interest and collect email signups',
          tool: 'Webflow, Framer, or HTML/CSS',
          priority: 'High'
        },
        {
          id: '2',
          title: 'Run Social Media Survey',
          description: 'Post targeted questions on relevant social media groups to validate problem-solution fit',
          tool: 'LinkedIn, Reddit, Facebook Groups',
          priority: 'High'
        },
        {
          id: '3',
          title: 'Conduct User Interviews',
          description: 'Interview 10-15 potential customers to understand their pain points and willingness to pay',
          tool: 'Zoom, Google Meet, Calendly',
          priority: 'Medium'
        }
      ];
      
      setSteps(aiGeneratedSteps);
      setShowAIDialog(false);
    } catch (error) {
      console.error('Error generating AI plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationPlan = steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.description}\nTool/Method: ${step.tool}\nPriority: ${step.priority}`
    ).join('\n\n');
    
    onValidationPlanSubmit(validationPlan);
    navigate('/summary');
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Create a Validation Plan</h1>
            <p className="text-gray-600">
              Define a few key steps to test your idea before investing time and money.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-6 space-y-4 relative">
                {steps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Step Title:
                    </label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                      placeholder="e.g., Create Landing Page"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal or Description:
                    </label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                      placeholder="What do you want to achieve with this step?"
                      className="min-h-[80px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tool or Method:
                    </label>
                    <Input
                      value={step.tool}
                      onChange={(e) => updateStep(step.id, 'tool', e.target.value)}
                      placeholder="e.g., Google Forms, Webflow, User interviews"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority:
                    </label>
                    <Select value={step.priority} onValueChange={(value) => updateStep(step.id, 'priority', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="w-full flex items-center justify-center gap-2 py-3 border-dashed"
            >
              <Plus className="h-4 w-4" />
              Add another step
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAIDialog(true)}
              className="w-full flex items-center justify-center gap-2 py-3"
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
            
            <div className="flex justify-between pt-6">
              <Button
                type="button" 
                variant="outline"
                onClick={() => navigate('/features')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </Button>
              
              <Button 
                type="submit" 
                className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate a Smart Validation Plan</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                We'll use your project idea and competitor list to generate a 3–5 step plan, including tools to use and signals to look for.
              </p>
              <p className="text-sm text-blue-600 flex items-center gap-1">
                💡 Use this if you're unsure how to start or want inspiration.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAIDialog(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="gradient-bg border-none hover:opacity-90 button-transition"
            >
              {isGenerating ? 'Generating...' : 'Generate Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidationPlanPage;
