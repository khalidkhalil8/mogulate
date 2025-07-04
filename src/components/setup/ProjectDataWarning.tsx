
import React, { useEffect } from 'react';

interface ProjectDataWarningProps {
  projectId: string | null;
}

const ProjectDataWarning: React.FC<ProjectDataWarningProps> = ({ projectId }) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!projectId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectId]);

  return null;
};

export default ProjectDataWarning;
