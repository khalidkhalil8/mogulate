
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import UserInfoCard from "@/components/settings/UserInfoCard";
import ProjectCreditsOverview from "@/components/settings/ProjectCreditsOverview";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Settings | Mogulate</title>
      </Helmet>
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="space-y-6">
            <UserInfoCard />
            <ProjectCreditsOverview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
