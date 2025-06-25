
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const SetupNavigation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full border-b bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold bg-clip-text text-transparent gradient-bg">
          Mogulate
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default SetupNavigation;
