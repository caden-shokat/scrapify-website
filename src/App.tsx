import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import ScrapeData from "./pages/ad-intelligence/ScrapeData";  
import TopHeadlines from "./pages/ad-intelligence/TopHeadlines";
import TopImages from "./pages/ad-intelligence/TopImages";
import AnstrexData from "./pages/ad-intelligence/AnstrexData";
import CTRPotential from "./pages/ad-intelligence/CTRPotential";
import HeadlineGenerator from "./pages/ai-studio/HeadlineGenerator";
import ImageClassifier from "./pages/ai-studio/ImageClassifier";
import CTRPrediction from "./pages/ai-studio/CTRPrediction";
import PerformanceReports from "./pages/reports/PerformanceReports";
import TrendAnalysis from "./pages/reports/TrendAnalysis";
import CampaignAnalytics from "./pages/analytics/CampaignAnalytics";
import CompetitiveAnalysis from "./pages/analytics/CompetitiveAnalysis";
import NotFound from "./pages/NotFound";
import Favorites from "./pages/Favorites";
import GeneratedHeadlines from "./pages/AIHeadlines";
import TopAIHeadlines from "./pages/ai-studio/TopAIHeadlines";
import LoginPage from "./pages/Login";
import { useAuth } from "./hooks/useAuth"
import LoadingSpinner from "@/components/LoadingSpinner"

const queryClient = new QueryClient();

function PrivateRoute({ children }: {children: JSX.Element }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingSpinner />
  return session ? children : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/*" element={
            <PrivateRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Ad Intelligence Routes */}
                  <Route path="/ad-intelligence/scrape-data" element={<ScrapeData />} />
                  <Route path="/ad-intelligence/top-headlines" element={<TopHeadlines />} />
                  <Route path="/ad-intelligence/top-images" element={<TopImages />} />
                  <Route path="/ad-intelligence/anstrex-data" element={<AnstrexData />} />
                  <Route path="/ad-intelligence/ctr-potential" element={<CTRPotential />} />
                  
                  {/* AI Studio Routes */}
                  <Route path="/ai-studio/headline-generator" element={<HeadlineGenerator />} />
                  <Route path="/ai-studio/image-classifier" element={<ImageClassifier />} />
                  <Route path="/ai-studio/ctr-prediction" element={<CTRPrediction />} />
                  <Route path="/ai-studio/top-ai-headlines" element={<TopAIHeadlines />} />
                  
                  {/* Reports Routes */}
                  <Route path="/reports/performance" element={<PerformanceReports />} />
                  <Route path="/reports/trends" element={<TrendAnalysis />} />
                  
                  {/* Analytics Routes */}
                  <Route path="/analytics/campaigns" element={<CampaignAnalytics />} />
                  <Route path="/analytics/competitive" element={<CompetitiveAnalysis />} />
                  
                  {/* Favorites Route */}
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/ai-headlines" element={<GeneratedHeadlines />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </PrivateRoute>
          }
        />
        
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
