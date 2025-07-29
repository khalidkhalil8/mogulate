
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PricingPage from "./pages/PricingPage";
import FeaturesPage from "./pages/FeaturesPage";
import NotFound from "./pages/NotFound";
import ProjectPage from "./pages/ProjectPage";
import ProjectEditPage from "./pages/ProjectEditPage";
import ProjectCompetitorsPage from "./pages/ProjectCompetitorsPage";
import ProjectMarketAnalysisPage from "./pages/ProjectMarketAnalysisPage";
import ProjectValidationPlanPage from "./pages/ProjectValidationPlanPage";
import ProjectFeedbackTrackingPage from "./pages/ProjectFeedbackTrackingPage";
import ProjectTodoPage from "./pages/ProjectTodoPage";

// Legacy setup components
import IdeaEntryPage from "./components/IdeaEntryPage";
import CompetitorDiscoveryPage from "./components/CompetitorDiscoveryPage";
import MarketGapPage from "./components/MarketGapPage";
import FeatureEntryPage from "./components/FeatureEntryPage";
import ValidationPlanPage from "./components/ValidationPlanPage";
import SummaryPage from "./components/SummaryPage";

// New guided setup flow
import ProjectSetupFlow from "./components/project-setup/ProjectSetupFlow";

import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

const queryClient = new QueryClient();

function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <QueryProvider>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                
                {/* Legacy setup routes - kept for backward compatibility */}
                <Route path="/idea" element={<IdeaEntryPage />} />
                <Route path="/competitors" element={<CompetitorDiscoveryPage />} />
                <Route path="/market-gaps" element={<MarketGapPage />} />
                <Route path="/features-setup" element={<FeatureEntryPage />} />
                <Route path="/validation-plan" element={<ValidationPlanPage />} />
                <Route path="/summary" element={<SummaryPage />} />
                
                {/* New guided project setup flow */}
                <Route path="/project-setup/*" element={<ProjectSetupFlow />} />
                
                {/* Project management routes */}
                <Route path="/project/:projectId" element={<ProjectPage />} />
                <Route path="/project/:projectId/edit" element={<ProjectEditPage />} />
                <Route path="/project/:projectId/setup" element={<ProjectEditPage />} />
                <Route path="/project/:projectId/competitors" element={<ProjectCompetitorsPage />} />
                <Route path="/project/:projectId/market-analysis" element={<ProjectMarketAnalysisPage />} />
                <Route path="/project/:projectId/validation-plan" element={<ProjectValidationPlanPage />} />
                <Route path="/project/:projectId/feedback" element={<ProjectFeedbackTrackingPage />} />
                <Route path="/project/:projectId/todo" element={<ProjectTodoPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </QueryProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
