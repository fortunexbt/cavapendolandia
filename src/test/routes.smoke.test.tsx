import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Offri from "@/pages/Offri";
import Entra from "@/pages/Entra";
import AdminLogin from "@/pages/AdminLogin";

// mock i18next + react-i18next so t() resolves synchronously in tests
vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty" },
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "offri.title": "Lascia una cavapendolata",
        "offri.subtitle": "Cosa lasci?",
        "index.title": "Cavapendolandia",
        "header.enter": "Entra",
        "index.subtitle": "Un mondo di creature",
        "checose.title": "Che cos'è Cavapendolandia",
        "regole.title": "Regole di Cavapendolandia",
        "grazie.title": "Grazie per la tua offerta",
        "offeringDetail.back": "Torna alla galleria",
        "offri.initiativeLabel": "Un pensiero",
        "gallery.guide.fieldNote": "Esplora il mondo",
        "adminLogin.title": "Admin",
        "adminLogin.subtitle": "Accedi",
        "adminLogin.emailPlaceholder": "Email admin",
        "adminLogin.passwordPlaceholder": "Password",
        "adminLogin.signIn": "Accedi",
        "adminLogin.signingIn": "Accesso...",
        "adminLogin.signInSuccess": "Accesso effettuato",
        "adminLogin.authError": "Errore di autenticazione",
        "adminLogin.connectionError": "Errore di connessione",
        "adminLogin.showPassword": "Mostra password",
        "adminLogin.hidePassword": "Nascondi password",
        "adminLogin.authenticatedNoAccess": "Accesso negato",
      };
      return map[key] ?? key;
    },
    i18n: { language: "it" },
  }),
}));

vi.mock("i18next", () => ({
  default: {
    use: () => ({ init: () => {} }),
    init: () => {},
    t: (key: string) => key,
    language: "it",
    on: vi.fn(),
  },
}));

interface SupabaseQueryChain {
  select: () => SupabaseQueryChain;
  eq: () => SupabaseQueryChain;
  neq: () => SupabaseQueryChain;
  order: () => SupabaseQueryChain;
  limit: () => Promise<{ data: []; error: null }>;
  maybeSingle: () => Promise<{ data: null; error: null }>;
  insert: () => Promise<{ data: null; error: null }>;
  update: () => Promise<{ data: null; error: null }>;
  delete: () => Promise<{ data: null; error: null }>;
}

vi.mock("@/components/CavapendoWorld", () => ({
  default: () => <div data-testid="world-stub" />,
}));

vi.mock("@/hooks/useActiveInitiative", () => ({
  useActiveInitiative: () => ({ data: null, isLoading: false }),
}));

vi.mock("@/hooks/useAdmin", () => ({
  useAdmin: () => ({
    user: null,
    isAdmin: false,
    loading: false,
    signOut: vi.fn(),
    isDemo: false,
  }),
}));

vi.mock("@/integrations/supabase/client", () => {
  const chain: SupabaseQueryChain = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    order: () => chain,
    limit: async () => ({ data: [], error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  };

  return {
    supabase: {
      from: () => chain,
      rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
      auth: {
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
      storage: {
        from: () => ({
          createSignedUrl: vi.fn(),
          upload: vi.fn(),
        }),
      },
    },
  };
});

const renderWithRouter = (
  component: ReactNode,
  options?: { initialEntries?: string[] },
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={options?.initialEntries}
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        {component}
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("route smoke", () => {
  it("renderizza la Soglia", () => {
    const view = renderWithRouter(<Index />);
    expect(
      view.getByRole("heading", { name: /Cavapendolandia/i }),
    ).toBeInTheDocument();
    expect(view.getByRole("link", { name: /galleria/i })).toBeInTheDocument();
    expect(view.getByTestId("world-stub")).toBeInTheDocument();
  });

  it("renderizza il flusso Offri", () => {
    const view = renderWithRouter(<Offri />);
    expect(
      view.getByRole("heading", { name: /Lascia una cavapendolata/i }),
    ).toBeInTheDocument();
    expect(view.getAllByText(/Cosa lasci\?/i).length).toBeGreaterThan(0);
  });

  it("reindirizza Entra verso la galleria", () => {
    const view = renderWithRouter(
      <Routes>
        <Route path="/entra" element={<Entra />} />
        <Route path="/galleria" element={<div>Galleria corrente</div>} />
      </Routes>,
      { initialEntries: ["/entra"] },
    );

    expect(view.getByText(/Galleria corrente/i)).toBeInTheDocument();
  });

  it("renderizza la login admin", async () => {
    const view = renderWithRouter(<AdminLogin />);
    expect(
      await view.findByRole("heading", { name: /Admin/i }),
    ).toBeInTheDocument();
    expect(view.getByPlaceholderText("Email admin")).toBeInTheDocument();
    expect(view.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(view.getByRole("button", { name: /^Accedi$/i })).toBeInTheDocument();
  });
});
