import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import CavapendoliPrelude from "@/components/CavapendoliPrelude";
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

const AnimatedRoutes = () => {
  const location = useLocation();
  const showPrelude = !location.pathname.startsWith("/admin");

  return (
    <>
      {showPrelude && <CavapendoliPrelude triggerKey={location.pathname} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Routes location={location}>
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
            <Route path="/admin/nascosti" element={<Anticamera statusFilter="hidden" />} />
            <Route path="/admin/rifiutati" element={<Anticamera statusFilter="rejected" />} />
            <Route path="/admin/o/:id" element={<AdminOfferingDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
