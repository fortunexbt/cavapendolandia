import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Offri from "@/pages/Offri";
import Entra from "@/pages/Entra";
import AdminLogin from "@/pages/AdminLogin";

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
    expect(view.getByRole("link", { name: /Entra/i })).toBeInTheDocument();
    expect(view.getByTestId("world-stub")).toBeInTheDocument();
  });

  it("renderizza il flusso Offri", () => {
    const view = renderWithRouter(<Offri />);
    expect(
      view.getByRole("heading", { name: /Lascia una cavapendolata/i }),
    ).toBeInTheDocument();
    expect(view.getByText(/Cosa lasci\?/i)).toBeInTheDocument();
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
    expect(view.getByPlaceholderText(/Email admin/i)).toBeInTheDocument();
    expect(view.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(view.getByRole("button", { name: /^Accedi$/i })).toBeInTheDocument();
  });
});
