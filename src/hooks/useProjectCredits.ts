
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';

export interface ProjectCredits {
  projectId: string;
  creditsUsed: number;
  creditsRemaining: number;
  creditsLimit: number;
  canUseCredits: boolean;
  tier: string;
}

export const useProjectCredits = (projectId: string) => {
  const { userProfile } = useAuth();
  const { projects, updateProject } = useProjects();
  const [isLoading, setIsLoading] = useState(false);

  const project = projects.find(p => p.id === projectId);
  const currentTier = userProfile?.subscription_tier || 'free';

  const getCreditsLimit = (tier: string) => {
    switch (tier) {
      case 'free':
        return 4;
      case 'starter':
        return 10;
      case 'pro':
        return Infinity;
      default:
        return 4;
    }
  };

  const creditsLimit = getCreditsLimit(currentTier);
  const creditsUsed = project?.credits_used || 0;
  const creditsRemaining = creditsLimit === Infinity ? Infinity : Math.max(0, creditsLimit - creditsUsed);
  const canUseCredits = creditsLimit === Infinity || creditsUsed < creditsLimit;

  const useCredit = async (actionType: string) => {
    if (!project || !canUseCredits) {
      return false;
    }

    setIsLoading(true);
    try {
      const newCreditsUsed = creditsUsed + 1;
      await updateProject(projectId, { credits_used: newCreditsUsed });
      
      console.log(`Credit used for ${actionType}. Credits used: ${newCreditsUsed}/${creditsLimit}`);
      return true;
    } catch (error) {
      console.error('Error using credit:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const projectCredits: ProjectCredits = {
    projectId,
    creditsUsed,
    creditsRemaining,
    creditsLimit,
    canUseCredits,
    tier: currentTier,
  };

  return {
    projectCredits,
    useCredit,
    isLoading,
  };
};
