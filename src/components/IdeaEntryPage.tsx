
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IdeaEntryPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to new guided setup flow
    navigate('/project-setup/start', { replace: true });
  }, [navigate]);

  return null;
};

export default IdeaEntryPage;
