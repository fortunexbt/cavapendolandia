import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "@/pages/AdminLogin";
import Anticamera from "@/pages/admin/Anticamera";
import AdminOfferingDetail from "@/pages/admin/AdminOfferingDetail";
import WorldExperience from "@/world/WorldExperience";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/anticamera" element={<Anticamera statusFilter="pending" />} />
          <Route path="/admin/archivio" element={<Anticamera statusFilter="approved" />} />
          <Route path="/admin/nascosti" element={<Anticamera statusFilter="hidden" />} />
          <Route path="/admin/rifiutati" element={<Anticamera statusFilter="rejected" />} />
          <Route path="/admin/o/:id" element={<AdminOfferingDetail />} />
          <Route path="*" element={<WorldExperience />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
