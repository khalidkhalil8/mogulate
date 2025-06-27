
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectEditPage from "@/pages/ProjectEditPage";
import FeaturesPage from "@/pages/FeaturesPage";
import PricingPage from "@/pages/PricingPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <Helmet>
              <title>Mogulate - Validate Your Business Ideas</title>
              <meta name="description" content="Validate your business ideas with AI-powered market research and competitor analysis." />
            </Helmet>
            <div className="min-h-screen bg-white">
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/idea" element={<Index />} />
                <Route path="/competitors" element={<Index />} />
                <Route path="/market-gaps" element={<Index />} />
                <Route path="/features" element={<Index />} />
                <Route path="/validation-plan" element={<Index />} />
                <Route path="/summary" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/project/:id" element={<ProjectEditPage />} />
                <Route path="/project/:id/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
