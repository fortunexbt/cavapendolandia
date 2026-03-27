import { Suspense, lazy, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import CavapendoliPrelude from "@/components/CavapendoliPrelude";
import { useThemeMode } from "@/hooks/useThemeMode";
const Index = lazy(() => import("./pages/Index"));
const Entra = lazy(() => import("./pages/Entra"));
const OfferingDetail = lazy(() => import("./pages/OfferingDetail"));
const Offri = lazy(() => import("./pages/Offri"));
const CheCose = lazy(() => import("./pages/CheCose"));
const Regole = lazy(() => import("./pages/Regole"));
const Rimozione = lazy(() => import("./pages/Rimozione"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Anticamera = lazy(() => import("./pages/admin/Anticamera"));
const AdminOfferingDetail = lazy(
  () => import("./pages/admin/AdminOfferingDetail"),
);
const NotFound = lazy(() => import("./pages/NotFound"));
const Galleria = lazy(() => import("./pages/Galleria"));
const Grazie = lazy(() => import("./pages/Grazie"));

const RouteLoadingFallback = () => (
  <div className="min-h-screen bg-[#120d0c]" />
);

const RouteBoundary = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>
);

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  useThemeMode(); // apply dark/light class globally on mount
  const showPrelude = !location.pathname.startsWith("/admin");

  const handlePreludeComplete = () => {
    // Prelude component handles its own visibility
  };

  return (
    <>
      {showPrelude && <CavapendoliPrelude onComplete={handlePreludeComplete} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route
              path="/"
              element={
                <RouteBoundary>
                  <Index />
                </RouteBoundary>
              }
            />
            <Route
              path="/entra"
              element={
                <RouteBoundary>
                  <Entra />
                </RouteBoundary>
              }
            />
            <Route
              path="/galleria"
              element={
                <RouteBoundary>
                  <Galleria />
                </RouteBoundary>
              }
            />
            <Route
              path="/grazie"
              element={
                <RouteBoundary>
                  <Grazie />
                </RouteBoundary>
              }
            />
            <Route
              path="/o/:id"
              element={
                <RouteBoundary>
                  <OfferingDetail />
                </RouteBoundary>
              }
            />
            <Route
              path="/offri"
              element={
                <RouteBoundary>
                  <Offri />
                </RouteBoundary>
              }
            />
            <Route
              path="/che-cose"
              element={
                <RouteBoundary>
                  <CheCose />
                </RouteBoundary>
              }
            />
            <Route
              path="/regole"
              element={
                <RouteBoundary>
                  <Regole />
                </RouteBoundary>
              }
            />
            <Route
              path="/rimozione"
              element={
                <RouteBoundary>
                  <Rimozione />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin"
              element={
                <RouteBoundary>
                  <AdminLogin />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/anticamera"
              element={
                <RouteBoundary>
                  <Anticamera statusFilter="pending" />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/archivio"
              element={
                <RouteBoundary>
                  <Anticamera statusFilter="approved" />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/nascosti"
              element={
                <RouteBoundary>
                  <Anticamera statusFilter="hidden" />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/rifiutati"
              element={
                <RouteBoundary>
                  <Anticamera statusFilter="rejected" />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/o/:id"
              element={
                <RouteBoundary>
                  <AdminOfferingDetail />
                </RouteBoundary>
              }
            />
            <Route
              path="*"
              element={
                <RouteBoundary>
                  <NotFound />
                </RouteBoundary>
              }
            />
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
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
