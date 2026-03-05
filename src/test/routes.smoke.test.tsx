import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import Index from "@/pages/Index";
import Offri from "@/pages/Offri";
import Entra from "@/pages/Entra";
import AdminLogin from "@/pages/AdminLogin";

vi.mock("@/integrations/supabase/client", () => {
  const chain: any = {
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
        signInWithOtp: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
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

const renderWithRouter = (component: ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("route smoke", () => {
  it("renderizza la Soglia", () => {
    renderWithRouter(<Index />);
    expect(
      screen.getByText(/Che cosa significa Cavapendoli per te/i),
    ).toBeInTheDocument();
  });

  it("renderizza il flusso Offri", () => {
    renderWithRouter(<Offri />);
    expect(
      screen.getByRole("heading", { name: /Lascia una cavapendolata/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cosa lasci\?/i)).toBeInTheDocument();
  });

  it("renderizza Entra in stato revisione", () => {
    renderWithRouter(<Entra />);
    expect(screen.getByText(/Archivio in revisione/i)).toBeInTheDocument();
  });

  it("renderizza la login admin", () => {
    renderWithRouter(<AdminLogin />);
    expect(screen.getByRole("heading", { name: /Admin/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email admin/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Invia link magico/i })).toBeInTheDocument();
  });
});
