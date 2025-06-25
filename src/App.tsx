
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./context/AuthContext";
import HomePage from "./components/HomePage";
import DashboardSidebar from "./components/dashboard/DashboardSidebar";
import Header from "./components/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component that provides sidebar layout for authenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // Show nothing while authentication state is loading
  if (isLoading) return null;
  
  // Redirect to auth page if not authenticated
  if (!user) return <Navigate to="/auth" replace />;
  
  return (
    <div className="min-h-screen flex">
      <DashboardSidebar onNewProject={() => {}} />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
};

// Landing page route that redirects authenticated users to dashboard
const LandingPageRoute = () => {
  const { user, isLoading } = useAuth();
  
  // Show nothing while authentication state is loading
  if (isLoading) return null;
  
  // Redirect to dashboard if authenticated
  if (user) return <Navigate to="/dashboard" replace />;
  
  return (
    <>
      <Header />
      <HomePage />
    </>
  );
};

// Auth page route that redirects authenticated users to dashboard
const AuthPageRoute = () => {
  const { user, isLoading } = useAuth();
  
  // Show nothing while authentication state is loading
  if (isLoading) return null;
  
  // Redirect to dashboard if authenticated
  if (user) return <Navigate to="/dashboard" replace />;
  
  return (
    <>
      <Header />
      <AuthPage />
    </>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPageRoute />} />
      <Route path="/auth" element={<AuthPageRoute />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/idea" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/competitors" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/market-gaps" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/validation-plan" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/summary" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pricing" 
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <Toaster />
        <Sonner position="top-right" closeButton />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
