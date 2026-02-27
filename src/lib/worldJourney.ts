const STORAGE_KEY = "cavapendoli-world-journey";

const clampJourney = (value: number) => Math.min(0.98, Math.max(0.02, value));

type JourneySnapshot = {
  journey: number;
  updatedAt: number;
};

export type JourneyWorldMode = "soglia" | "vaga" | "silenzio";

export type RouteWorldProfile = {
  anchor: number;
  mode: JourneyWorldMode;
  label: string;
  tintA: string;
  tintB: string;
};

const ROUTE_PROFILES = {
  home: {
    anchor: 0.14,
    mode: "soglia",
    label: "Soglia",
    tintA: "rgba(236, 188, 93, 0.62)",
    tintB: "rgba(82, 177, 196, 0.48)",
  },
  entra: {
    anchor: 0.56,
    mode: "vaga",
    label: "Vaga",
    tintA: "rgba(72, 191, 203, 0.6)",
    tintB: "rgba(240, 132, 86, 0.42)",
  },
  offering: {
    anchor: 0.62,
    mode: "vaga",
    label: "Archivio Vivo",
    tintA: "rgba(83, 194, 204, 0.56)",
    tintB: "rgba(239, 119, 83, 0.4)",
  },
  offri: {
    anchor: 0.84,
    mode: "silenzio",
    label: "Deposito",
    tintA: "rgba(139, 164, 214, 0.58)",
    tintB: "rgba(227, 175, 100, 0.36)",
  },
  regole: {
    anchor: 0.91,
    mode: "silenzio",
    label: "Patto",
    tintA: "rgba(139, 164, 214, 0.6)",
    tintB: "rgba(207, 132, 96, 0.34)",
  },
  rimozione: {
    anchor: 0.96,
    mode: "silenzio",
    label: "Rimozione",
    tintA: "rgba(127, 153, 198, 0.62)",
    tintB: "rgba(206, 128, 92, 0.34)",
  },
  cheCose: {
    anchor: 0.14,
    mode: "soglia",
    label: "Manifesto",
    tintA: "rgba(239, 188, 89, 0.58)",
    tintB: "rgba(80, 178, 198, 0.42)",
  },
  admin: {
    anchor: 0.5,
    mode: "silenzio",
    label: "Admin",
    tintA: "rgba(157, 171, 188, 0.44)",
    tintB: "rgba(109, 125, 148, 0.34)",
  },
  fallback: {
    anchor: 0.5,
    mode: "vaga",
    label: "Passaggio",
    tintA: "rgba(106, 177, 198, 0.5)",
    tintB: "rgba(226, 153, 91, 0.34)",
  },
} as const satisfies Record<string, RouteWorldProfile>;

export const readWorldJourney = (fallback: number): number => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clampJourney(fallback);
    const parsed = JSON.parse(raw) as JourneySnapshot | null;
    if (!parsed || typeof parsed.journey !== "number") return clampJourney(fallback);
    return clampJourney(parsed.journey);
  } catch {
    return clampJourney(fallback);
  }
};

export const persistWorldJourney = (journey: number) => {
  try {
    const snapshot: JourneySnapshot = {
      journey: clampJourney(journey),
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Non-blocking persistence.
  }
};

export const nearestJourneyAnchor = (journey: number, anchors: number[]) => {
  let closest = anchors[0] ?? journey;
  let distance = Number.POSITIVE_INFINITY;
  anchors.forEach((anchor) => {
    const d = Math.abs(journey - anchor);
    if (d < distance) {
      distance = d;
      closest = anchor;
    }
  });
  return clampJourney(closest);
};

export const resolveJourneyForPage = (anchor: number, memoryInfluence = 0.35) => {
  const stored = readWorldJourney(anchor);
  const influence = Math.max(0, Math.min(1, memoryInfluence));
  return clampJourney(anchor + (stored - anchor) * influence);
};

export const clampJourneyVelocity = (velocity: number, max = 0.028) =>
  Math.max(-max, Math.min(max, velocity));

export const isAdminPath = (pathname: string) => pathname.startsWith("/admin");

export const getRouteWorldProfile = (pathname: string): RouteWorldProfile => {
  if (pathname === "/") return ROUTE_PROFILES.home;
  if (pathname.startsWith("/entra")) return ROUTE_PROFILES.entra;
  if (pathname.startsWith("/offri")) return ROUTE_PROFILES.offri;
  if (pathname.startsWith("/o/")) return ROUTE_PROFILES.offering;
  if (pathname.startsWith("/che-cose")) return ROUTE_PROFILES.cheCose;
  if (pathname.startsWith("/regole")) return ROUTE_PROFILES.regole;
  if (pathname.startsWith("/rimozione")) return ROUTE_PROFILES.rimozione;
  if (isAdminPath(pathname)) return ROUTE_PROFILES.admin;
  return ROUTE_PROFILES.fallback;
};
