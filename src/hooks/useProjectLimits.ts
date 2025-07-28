
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";

export const useProjectLimits = () => {
  const { userProfile } = useAuth();
  const { projects } = useProjects();

  const getProjectLimit = (tier: string) => {
    switch (tier) {
      case 'free':
        return 1;
      case 'starter':
        return 5;
      case 'pro':
        return Infinity;
      default:
        return 1;
    }
  };

  const currentTier = userProfile?.subscription_tier || 'free';
  const projectLimit = getProjectLimit(currentTier);
  const currentProjectCount = projects.length;
  const canCreateProject = currentProjectCount < projectLimit;
  const isAtLimit = currentProjectCount >= projectLimit;

  return {
    projectLimit,
    currentProjectCount,
    canCreateProject,
    isAtLimit,
    currentTier,
  };
};
