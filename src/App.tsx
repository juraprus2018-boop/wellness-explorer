import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ProvinciePage from "./pages/ProvinciePage";
import PlaatsPage from "./pages/PlaatsPage";
import SaunaDetailPage from "./pages/SaunaDetailPage";
import Top10Page from "./pages/Top10Page";
import KaartPage from "./pages/KaartPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAddSaunaPage from "./pages/admin/AdminAddSaunaPage";
import AdminTop10Page from "./pages/admin/AdminTop10Page";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes with header/footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/sauna/:provincie" element={<ProvinciePage />} />
            <Route path="/sauna/:provincie/:plaatsnaam" element={<PlaatsPage />} />
            <Route path="/sauna/:provincie/:plaatsnaam/:slug" element={<SaunaDetailPage />} />
            <Route path="/de-beste-saunas-van-nederland" element={<Top10Page />} />
            <Route path="/kaart" element={<KaartPage />} />
          </Route>

          {/* Admin routes (no public header/footer) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/saunas/toevoegen" element={<AdminAddSaunaPage />} />
          <Route path="/admin/top-10" element={<AdminTop10Page />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
