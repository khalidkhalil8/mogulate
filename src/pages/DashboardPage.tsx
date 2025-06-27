import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar, Trash2 } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, isLoading, deleteProject } = useProjects();

  const handleProjectClick = (project: any) => {
    // Navigate to the project edit page
    navigate(`/project/${project.id}`);
  };

  const handleNewProject = () => {
    navigate("/idea");
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Dashboard | Mogulate</title>
      </Helmet>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <Button onClick={handleNewProject} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="max-w-md mx-auto">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
                <p className="text-gray-600 mb-6">
                  Create your first project to start validating your business ideas
                </p>
                <Button onClick={handleNewProject} size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Get Started
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2" onClick={() => handleProjectClick(project)}>
                        {project.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="text-gray-400 hover:text-red-500 -mt-1 -mr-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => handleProjectClick(project)}>
                    {project.idea && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.idea}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Last edited: {new Date(project.updated_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
