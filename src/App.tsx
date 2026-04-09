import React, { Suspense, lazy, type ReactNode, type ReactElement } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import CavapendoliPrelude from "@/components/CavapendoliPrelude";
import { useThemeMode } from "@/hooks/useThemeMode";

function AppErrorFallback() {
  const { t } = useTranslation();
  return (
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
            {t("app.errorBoundary.title")}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#dbcbbc]">
            {t("app.errorBoundary.body")}
          </p>
        </div>
      </div>
    </div>
  );
}

type ErrorBoundaryProps = {
  children: ReactElement;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <AppErrorFallback />;
    }

    return this.props.children;
  }
}
const Index = lazy(() => import("./pages/Index"));
const Entra = lazy(() => import("./pages/Entra"));
const OfferingDetail = lazy(() => import("./pages/OfferingDetail"));
const Offri = lazy(() => import("./pages/Offri"));
const CheCose = lazy(() => import("./pages/CheCose"));
const Regole = lazy(() => import("./pages/Regole"));
const Rimozione = lazy(() => import("./pages/Rimozione"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const OfferingsPending = lazy(() => import("./pages/admin/OfferingsPending"));
const OfferingsApproved = lazy(() => import("./pages/admin/OfferingsApproved"));
const OfferingsHidden = lazy(() => import("./pages/admin/OfferingsHidden"));
const OfferingsRejected = lazy(() => import("./pages/admin/OfferingsRejected"));
const AdminOfferingDetail = lazy(
  () => import("./pages/admin/AdminOfferingDetail"),
);
const Iniziative = lazy(() => import("./pages/admin/Iniziative"));
const Messages = lazy(() => import("./pages/admin/Messages"));
const PagesEditor = lazy(() => import("./pages/admin/PagesEditor"));
const PratoEditor = lazy(() => import("./pages/admin/PratoEditor"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Galleria = lazy(() => import("./pages/Galleria"));
const Grazie = lazy(() => import("./pages/Grazie"));
const Contatti = lazy(() => import("./pages/Contatti"));

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
                <ErrorBoundary>
                  <RouteBoundary>
                    <Galleria />
                  </RouteBoundary>
                </ErrorBoundary>
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
              path="/contatti"
              element={
                <RouteBoundary>
                  <Contatti />
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
            {/* Admin auth — redirect to offerings if already logged in */}
            <Route
              path="/admin"
              element={
                <RouteBoundary>
                  <AdminLogin />
                </RouteBoundary>
              }
            />
            {/* Legacy redirects */}
            <Route
              path="/admin/anticamera"
              element={<Navigate to="/admin/offerings/pending" replace />}
            />
            <Route
              path="/admin/archivio"
              element={<Navigate to="/admin/offerings/approved" replace />}
            />
            <Route
              path="/admin/nascosti"
              element={<Navigate to="/admin/offerings/hidden" replace />}
            />
            <Route
              path="/admin/rifiutati"
              element={<Navigate to="/admin/offerings/rejected" replace />}
            />
            {/* Admin offerings */}
            <Route
              path="/admin/offerings/pending"
              element={
                <RouteBoundary>
                  <OfferingsPending />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/offerings/approved"
              element={
                <RouteBoundary>
                  <OfferingsApproved />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/offerings/hidden"
              element={
                <RouteBoundary>
                  <OfferingsHidden />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/offerings/rejected"
              element={
                <RouteBoundary>
                  <OfferingsRejected />
                </RouteBoundary>
              }
            />
            {/* Admin offering detail */}
            <Route
              path="/admin/o/:id"
              element={
                <RouteBoundary>
                  <AdminOfferingDetail />
                </RouteBoundary>
              }
            />
            {/* Admin sections */}
            <Route
              path="/admin/iniziative"
              element={
                <RouteBoundary>
                  <Iniziative />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/pagine"
              element={
                <RouteBoundary>
                  <PagesEditor />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/prato"
              element={
                <RouteBoundary>
                  <PratoEditor />
                </RouteBoundary>
              }
            />
            <Route
              path="/admin/messaggi"
              element={
                <RouteBoundary>
                  <Messages />
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
