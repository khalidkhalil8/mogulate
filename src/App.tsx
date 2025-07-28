
import { Helmet, HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import FeaturesPage from "@/pages/FeaturesPage";
import ProjectEditPage from "@/pages/ProjectEditPage";
import ProjectCompetitorsPage from "@/pages/ProjectCompetitorsPage";
import ProjectValidationPlanPage from "@/pages/ProjectValidationPlanPage";
import ProjectMarketAnalysisPage from "@/pages/ProjectMarketAnalysisPage";
import ProjectFeedbackTrackingPage from "@/pages/ProjectFeedbackTrackingPage";
import ProjectTodoPage from "@/pages/ProjectTodoPage";
import PricingPage from "@/pages/PricingPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <AuthProvider>
            <SidebarProvider>
              <div className="min-h-screen bg-background">
                <Helmet>
                  <title>Mogulate</title>
                </Helmet>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
                  <Route path="/projects/:id/competitors" element={<ProjectCompetitorsPage />} />
                  <Route path="/projects/:id/validation-plan" element={<ProjectValidationPlanPage />} />
                  <Route path="/projects/:id/market-analysis" element={<ProjectMarketAnalysisPage />} />
                  <Route path="/projects/:id/feedback-tracking" element={<ProjectFeedbackTrackingPage />} />
                  <Route path="/projects/:id/todos" element={<ProjectTodoPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
              <Sonner />
            </SidebarProvider>
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
