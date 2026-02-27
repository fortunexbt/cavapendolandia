import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import Index from "@/pages/Index";
import Offri from "@/pages/Offri";
import Entra from "@/pages/Entra";
import AdminLogin from "@/pages/AdminLogin";

vi.mock("@/integrations/supabase/client", () => {
  const builder: {
    select: () => typeof builder;
    eq: () => typeof builder;
    order: () => Promise<{ data: []; error: null }>;
  } = {
    select: () => builder,
    eq: () => builder,
    order: async () => ({ data: [], error: null }),
  };

  return {
    supabase: {
      from: () => builder,
      auth: {
        signInWithOtp: vi.fn(),
      },
      storage: {
        from: () => ({
          createSignedUrl: vi.fn(),
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
    expect(screen.getByRole("heading", { name: /Lascia un'offerta/i })).toBeInTheDocument();
    expect(screen.getByText(/Cosa lasci\?/i)).toBeInTheDocument();
  });

  it("renderizza Entra senza errori con archivio vuoto", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Entra />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Qui non c'è ancora nulla\./i)).toBeInTheDocument();
  });

  it("renderizza la login admin", () => {
    renderWithRouter(<AdminLogin />);
    expect(screen.getByRole("heading", { name: /Admin/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Invia link magico/i })).toBeInTheDocument();
  });
});
