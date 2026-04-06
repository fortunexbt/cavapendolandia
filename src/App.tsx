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
  <div className="relative min-h-screen overflow-hidden bg-[#120d0c] text-[#f3eadf]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,227,210,0.18),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(156,123,85,0.14),transparent_34%),linear-gradient(180deg,rgba(255,245,232,0.06),transparent_22%,rgba(0,0,0,0.2)_100%)]" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e7d8c2]/40 to-transparent" />
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-[#5b4739]/70 bg-[#140f0d]/82 px-8 py-10 shadow-[0_34px_110px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="font-mono-light text-[0.68rem] uppercase tracking-[0.26em] text-[#cbb59a]">
          Cavapendolandia
        </div>
        <div className="mt-4 h-px w-20 bg-gradient-to-r from-[#f0dfc7]/75 to-transparent" />
        <h1 className="mt-5 text-3xl font-light tracking-[0.16em] text-[#f7eee3]">
          Sto aprendo la soglia
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#dbcbbc]">
          Sto riallineando le stanze, le superfici dipinte e il passaggio fra
          galleria e prato.
        </p>
      </div>
    </div>
  </div>
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
