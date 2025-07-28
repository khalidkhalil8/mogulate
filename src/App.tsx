
import { Helmet, HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import PageLayout from "@/components/layout/PageLayout";
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
            <div className="min-h-screen bg-background">
              <Helmet>
                <title>Mogulate</title>
              </Helmet>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<PageLayout><DashboardPage /></PageLayout>} />
                <Route path="/features" element={<PageLayout><FeaturesPage /></PageLayout>} />
                <Route path="/projects/:id/edit" element={<PageLayout><ProjectEditPage /></PageLayout>} />
                <Route path="/projects/:id/competitors" element={<PageLayout><ProjectCompetitorsPage /></PageLayout>} />
                <Route path="/projects/:id/validation-plan" element={<PageLayout><ProjectValidationPlanPage /></PageLayout>} />
                <Route path="/projects/:id/market-analysis" element={<PageLayout><ProjectMarketAnalysisPage /></PageLayout>} />
                <Route path="/projects/:id/feedback-tracking" element={<PageLayout><ProjectFeedbackTrackingPage /></PageLayout>} />
                <Route path="/projects/:id/todos" element={<PageLayout><ProjectTodoPage /></PageLayout>} />
                <Route path="/pricing" element={<PageLayout><PricingPage /></PageLayout>} />
                <Route path="/profile" element={<PageLayout><ProfilePage /></PageLayout>} />
                <Route path="/settings" element={<PageLayout><SettingsPage /></PageLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
