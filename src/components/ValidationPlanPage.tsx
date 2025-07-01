
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';

interface ValidationStep {
  id: string;
  title: string;
  description: string;
  priority: string;
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
      priority: ''
    }
  ]);
  const navigate = useNavigate();
  
  const addStep = () => {
    const newStep: ValidationStep = {
      id: Date.now().toString(),
      title: '',
      description: '',
      priority: ''
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert steps to a formatted string for backwards compatibility
    const validationPlan = steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.description}\nPriority: ${step.priority}`
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
            <h1 className="text-3xl font-bold mb-2">Validation Plan</h1>
            <p className="text-gray-600">
              List the steps to validate your idea before investing heavily
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
                      Goal/Description:
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
                      Priority:
                    </label>
                    <Input
                      value={step.priority}
                      onChange={(e) => updateStep(step.id, 'priority', e.target.value)}
                      placeholder="High, Medium, Low"
                      required
                    />
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
    </div>
  );
};

export default ValidationPlanPage;
