import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import CavapendoliPrelude from "@/components/CavapendoliPrelude";
import WorldRouteVeil from "@/components/WorldRouteVeil";
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
import { getRouteWorldProfile, isAdminPath } from "@/lib/worldJourney";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const showPrelude = !isAdminPath(location.pathname);
  const profile = useMemo(() => getRouteWorldProfile(location.pathname), [location.pathname]);
  const previousAnchorRef = useRef(profile.anchor);
  const [routeMotion, setRouteMotion] = useState({ offsetX: 0, offsetY: 12, duration: 0.24 });

  useEffect(() => {
    const previousAnchor = previousAnchorRef.current;
    const delta = profile.anchor - previousAnchor;
    previousAnchorRef.current = profile.anchor;
    const movement = Math.abs(delta);

    setRouteMotion({
      offsetX: delta === 0 ? 0 : delta > 0 ? 22 : -22,
      offsetY: 12 + movement * 24,
      duration: 0.24 + movement * 0.24,
    });
  }, [profile.anchor, location.pathname]);

  return (
    <>
      {showPrelude && <CavapendoliPrelude triggerKey={location.pathname} />}
      {showPrelude && <WorldRouteVeil pathname={location.pathname} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: routeMotion.offsetX, y: routeMotion.offsetY }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: routeMotion.offsetX * -0.55, y: routeMotion.offsetY * 0.4 }}
          transition={{ duration: routeMotion.duration, ease: "easeOut" }}
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
