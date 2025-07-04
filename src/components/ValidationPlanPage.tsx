import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import SetupNavigation from './setup/SetupNavigation';
import ValidationPlanWelcomeState from './validation-plan/ValidationPlanWelcomeState';
import type { IdeaData } from '@/lib/types';

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
  ideaData?: IdeaData;
  selectedGapIndex?: number;
}

const ValidationPlanPage: React.FC<ValidationPlanPageProps> = ({ 
  initialValidationPlan = "", 
  onValidationPlanSubmit,
  ideaData,
  selectedGapIndex
}) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { projects, updateProject } = useProjects();
  const project = projects.find(p => p.id === projectId);
  
  const [steps, setSteps] = useState<ValidationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const navigate = useNavigate();
  
  // Check if we have the required data for generation
  const canGenerate = projectId 
    ? (project?.market_gap_analysis?.selected?.positioningSuggestion && project?.features && project.features.length > 0)
    : (ideaData?.idea && 
       ideaData?.marketGapScoringAnalysis && 
       selectedGapIndex !== undefined && 
       ideaData?.marketGapScoringAnalysis?.marketGaps?.[selectedGapIndex]?.positioningSuggestion &&
       ideaData?.features && ideaData.features.length > 0);
  
  // Update steps when project data loads
  useEffect(() => {
    if (project?.validation_plan && project.validation_plan.trim()) {
      try {
        const stepBlocks = project.validation_plan.split('\n\n').filter(block => block.trim());
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
          setHasGenerated(true);
        }
      } catch (error) {
        console.error('Error parsing validation plan:', error);
      }
    } else if (initialValidationPlan && initialValidationPlan.trim()) {
      // Parse initialValidationPlan for backwards compatibility
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
          setHasGenerated(true);
        }
      } catch (error) {
        console.error('Error parsing validation plan:', error);
      }
    }
  }, [project, initialValidationPlan]);

  const handleGenerateValidationPlan = async () => {
    if (!canGenerate) {
      toast.error('Please complete market positioning and features first');
      return;
    }

    setIsGenerating(true);
    try {
      let requestBody;

      if (projectId) {
        // Existing project flow
        requestBody = { project_id: projectId };
      } else {
        // Initial setup flow
        if (!ideaData || selectedGapIndex === undefined || !ideaData.marketGapScoringAnalysis) {
          toast.error('Missing required data for validation plan generation');
          return;
        }

        const positioningSuggestion = ideaData.marketGapScoringAnalysis.marketGaps[selectedGapIndex]?.positioningSuggestion;
        
        if (!positioningSuggestion) {
          toast.error('Positioning suggestion not found');
          return;
        }

        requestBody = {
          idea: ideaData.idea,
          positioningSuggestion: positioningSuggestion,
          features: ideaData.features
        };
      }

      const { data, error } = await supabase.functions.invoke('generate-validation-plan', {
        body: requestBody
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        const generatedSteps = data.validationSteps.map((step: any) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          tool: step.tool,
          priority: step.priority
        }));
        setSteps(generatedSteps);
        setHasGenerated(true);
        toast.success('Validation plan generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate validation plan');
      }
    } catch (error) {
      console.error('Error generating validation plan:', error);
      toast.error('Failed to generate validation plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationPlan = steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.description}\nTool/Method: ${step.tool}\nPriority: ${step.priority}`
    ).join('\n\n');
    
    if (projectId && project) {
      await updateProject(projectId, { validation_plan: validationPlan });
    }
    
    onValidationPlanSubmit(validationPlan);
    
    const nextUrl = projectId ? `/summary?projectId=${projectId}` : '/summary';
    navigate(nextUrl);
  };

  const handleBack = async () => {
    const validationPlan = steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.description}\nTool/Method: ${step.tool}\nPriority: ${step.priority}`
    ).join('\n\n');
    
    if (projectId && project) {
      await updateProject(projectId, { validation_plan: validationPlan });
    }
    
    onValidationPlanSubmit(validationPlan);
    
    const backUrl = projectId ? `/features?projectId=${projectId}` : '/features';
    navigate(backUrl);
  };

  const canProceed = hasGenerated || steps.length > 0;
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {!hasGenerated && steps.length === 0 ? (
            <ValidationPlanWelcomeState
              onGenerateValidationPlan={handleGenerateValidationPlan}
              isGenerating={isGenerating}
            />
          ) : (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Review & Edit Your Validation Plan</h1>
                <p className="text-gray-600">
                  {hasGenerated 
                    ? "AI has suggested validation steps based on your market positioning and features. You can edit them or add more."
                    : "Add and configure the validation steps you want to execute for your product."
                  }
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {steps.length > 0 && (
                  <div className="space-y-4">
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
                        
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Step {index + 1}</h3>
                        </div>
                        
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
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addStep}
                  className="w-full flex items-center justify-center gap-2 py-3 border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  Add another step
                </Button>
                
                <div className="flex justify-between pt-6">
                  <Button
                    type="button" 
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={!canProceed}
                    className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationPlanPage;
