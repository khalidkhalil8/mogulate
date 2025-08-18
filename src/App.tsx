
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import ProjectPage from "./pages/ProjectPage";
import ProjectEditPage from "./pages/ProjectEditPage";
import ProjectCompetitorsPage from "./pages/ProjectCompetitorsPage";
import ProjectFeedbackTrackingPage from "./pages/ProjectFeedbackTrackingPage";
import ProjectMarketAnalysisPage from "./pages/ProjectMarketAnalysisPage";
import ProjectValidationPlanPage from "./pages/ProjectValidationPlanPage";
import ProjectTodoPage from "./pages/ProjectTodoPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import NotFound from "./pages/NotFound";
import CompetitorDiscoveryPage from "./components/CompetitorDiscoveryPage";
import MarketGapPage from "./components/MarketGapPage";
import FeatureEntryPage from "./components/FeatureEntryPage";
import ValidationPlanPage from "./components/ValidationPlanPage";
import SummaryPage from "./components/SummaryPage";
import ProjectSetupPage from "./pages/ProjectSetupPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/project/:id" element={<ProjectPage />} />
                <Route path="/project/:id/edit" element={<ProjectEditPage />} />
                <Route path="/project/:id/competitors" element={<ProjectCompetitorsPage />} />
                <Route path="/project/:id/feedback" element={<ProjectFeedbackTrackingPage />} />
                <Route path="/project/:id/market-analysis" element={<ProjectMarketAnalysisPage />} />
                <Route path="/project/:id/validation-plan" element={<ProjectValidationPlanPage />} />
                <Route path="/project/:id/todos" element={<ProjectTodoPage />} />
                <Route path="/project/:id/features" element={<FeaturesPage />} />
                <Route path="/project-setup" element={<ProjectSetupPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/competitors" element={<CompetitorDiscoveryPage />} />
                <Route path="/market-gaps" element={<MarketGapPage />} />
                <Route path="/features" element={<FeatureEntryPage />} />
                <Route path="/validation-plan" element={<ValidationPlanPage />} />
                <Route path="/summary" element={<SummaryPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
