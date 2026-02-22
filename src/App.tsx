import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import AdminGuard from "./components/AdminGuard";
import Index from "./pages/Index";
import ProvinciePage from "./pages/ProvinciePage";
import PlaatsPage from "./pages/PlaatsPage";
import SaunaDetailPage from "./pages/SaunaDetailPage";
import Top10Page from "./pages/Top10Page";
import KaartPage from "./pages/KaartPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAddSaunaPage from "./pages/admin/AdminAddSaunaPage";
import AdminMapImportPage from "./pages/admin/AdminMapImportPage";
import AdminTop10Page from "./pages/admin/AdminTop10Page";
import AdminSaunasPage from "./pages/admin/AdminSaunasPage";
import AdminEditSaunaPage from "./pages/admin/AdminEditSaunaPage";
import AdminAdsPage from "./pages/admin/AdminAdsPage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes with header/footer */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/sauna/:provincie" element={<ProvinciePage />} />
              <Route path="/sauna/:provincie/:plaatsnaam" element={<PlaatsPage />} />
              <Route path="/sauna/:provincie/:plaatsnaam/:slug" element={<SaunaDetailPage />} />
              <Route path="/de-beste-saunas-van-nederland" element={<Top10Page />} />
              <Route path="/kaart" element={<KaartPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
            <Route path="/admin/saunas/toevoegen" element={<AdminGuard><AdminAddSaunaPage /></AdminGuard>} />
            <Route path="/admin/saunas/kaart-import" element={<AdminGuard><AdminMapImportPage /></AdminGuard>} />
            <Route path="/admin/saunas" element={<AdminGuard><AdminSaunasPage /></AdminGuard>} />
            <Route path="/admin/saunas/:id/bewerken" element={<AdminGuard><AdminEditSaunaPage /></AdminGuard>} />
            <Route path="/admin/advertenties" element={<AdminGuard><AdminAdsPage /></AdminGuard>} />
            <Route path="/admin/top-10" element={<AdminGuard><AdminTop10Page /></AdminGuard>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
