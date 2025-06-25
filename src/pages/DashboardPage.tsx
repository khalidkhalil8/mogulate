
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import { useUsageData } from "@/hooks/useUsageData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Calendar, Trash2 } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import LoadingState from "@/components/ui/LoadingState";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, isLoading, createProject, deleteProject } = useProjects();
  const { usageData } = useUsageData(user?.id);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectIdea, setNewProjectIdea] = useState("");

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;
    
    const project = await createProject(newProjectTitle, newProjectIdea);
    if (project) {
      setIsCreateDialogOpen(false);
      setNewProjectTitle("");
      setNewProjectIdea("");
      // Navigate to the idea entry page with the project context
      navigate("/idea");
    }
  };

  const handleProjectClick = (project: any) => {
    // Navigate to the appropriate step based on project completion
    if (!project.idea) {
      navigate("/idea");
    } else if (!project.competitors || project.competitors.length === 0) {
      navigate("/competitors");
    } else if (!project.market_gaps) {
      navigate("/market-gaps");
    } else if (!project.validation_plan) {
      navigate("/validation-plan");
    } else {
      navigate("/summary");
    }
  };

  const handleNewProject = () => {
    setIsCreateDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen flex">
      <Helmet>
        <title>Dashboard | Mogulate</title>
      </Helmet>

      <DashboardSidebar onNewProject={handleNewProject} />

      <main className="flex-1 p-6 ml-64">
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
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Enter project title"
              />
            </div>
            <div>
              <Label htmlFor="idea">Initial Idea (Optional)</Label>
              <Textarea
                id="idea"
                value={newProjectIdea}
                onChange={(e) => setNewProjectIdea(e.target.value)}
                placeholder="Describe your business idea..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={!newProjectTitle.trim()}>
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
