import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Entra from "./pages/Entra";
import OfferingDetail from "./pages/OfferingDetail";
import Offri from "./pages/Offri";
import CheCose from "./pages/CheCose";
import Regole from "./pages/Regole";
import Rimozione from "./pages/Rimozione";
import AdminLogin from "./pages/AdminLogin";
import Anticamera from "./pages/admin/Anticamera";
import AdminOfferingDetail from "./pages/admin/AdminOfferingDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/entra" element={<Entra />} />
          <Route path="/o/:id" element={<OfferingDetail />} />
          <Route path="/offri" element={<Offri />} />
          <Route path="/che-cose" element={<CheCose />} />
          <Route path="/regole" element={<Regole />} />
          <Route path="/rimozione" element={<Rimozione />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/anticamera" element={<Anticamera statusFilter="pending" />} />
          <Route path="/admin/archivio" element={<Anticamera statusFilter="approved" />} />
          <Route path="/admin/rifiutati" element={<Anticamera statusFilter="rejected" />} />
          <Route path="/admin/o/:id" element={<AdminOfferingDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
