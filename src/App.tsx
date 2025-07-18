
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectEditPage from "@/pages/ProjectEditPage";
import ProjectCompetitorsPage from "@/pages/ProjectCompetitorsPage";
import ProjectMarketAnalysisPage from "@/pages/ProjectMarketAnalysisPage";
import ProjectValidationPlanPage from "@/pages/ProjectValidationPlanPage";
import ProjectFeedbackTrackingPage from "@/pages/ProjectFeedbackTrackingPage";
import ProjectTodoPage from "@/pages/ProjectTodoPage";
import FeaturesPage from "@/pages/FeaturesPage";
import PricingPage from "@/pages/PricingPage";
import NotFound from "@/pages/NotFound";
import IdeaEntryPage from "@/components/IdeaEntryPage";
import CompetitorDiscoveryPage from "@/components/CompetitorDiscoveryPage";
import MarketGapPage from "@/components/MarketGapPage";
import FeatureEntryPage from "@/components/FeatureEntryPage";
import ValidationPlanPage from "@/components/ValidationPlanPage";
import SummaryPage from "@/components/SummaryPage";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  
  // Only show header on landing page for unauthenticated users
  const showHeader = location.pathname === '/' && !location.search;

  return (
    <>
      <Helmet>
        <title>Mogulate - Validate Your Business Ideas</title>
        <meta name="description" content="Validate your business ideas with AI-powered market research and competitor analysis." />
      </Helmet>
      <div className="min-h-screen bg-white">
        {showHeader && <Header />}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/idea" element={<IdeaEntryPage />} />
          <Route path="/competitors" element={<CompetitorDiscoveryPage />} />
          <Route path="/market-gaps" element={<MarketGapPage />} />
          <Route path="/features" element={<FeatureEntryPage />} />
          <Route path="/validation-plan" element={<ValidationPlanPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/project/:id" element={<ProjectEditPage />} />
          <Route path="/project/:id/competitors" element={<ProjectCompetitorsPage />} />
          <Route path="/project/:id/market-analysis" element={<ProjectMarketAnalysisPage />} />
          <Route path="/project/:id/validation-plan" element={<ProjectValidationPlanPage />} />
          <Route path="/project/:id/features" element={<FeaturesPage />} />
          <Route path="/project/:id/feedback-tracking" element={<ProjectFeedbackTrackingPage />} />
          <Route path="/project/:id/todos" element={<ProjectTodoPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
