export type TransitionRailProfile = {
  fromBias: number;
  toBias: number;
  liftA: number;
  liftB: number;
  sideA: number;
  sideB: number;
  bank: number;
  durationScale: number;
};

const BASE: TransitionRailProfile = {
  fromBias: 0.24,
  toBias: 0.24,
  liftA: 0.9,
  liftB: 0.9,
  sideA: 0,
  sideB: 0,
  bank: 0,
  durationScale: 1,
};

const make = (partial: Partial<TransitionRailProfile>): TransitionRailProfile => ({
  ...BASE,
  ...partial,
});

export const TRANSITION_RAILS: Record<string, TransitionRailProfile> = {
  "atrium-manifesto": make({ sideA: -1.2, sideB: -0.8, liftA: 1.4, liftB: 1.1, bank: -0.18 }),
  "manifesto-atrium": make({ sideA: 1.2, sideB: 0.8, liftA: 1.3, liftB: 1.0, bank: 0.16 }),
  "atrium-archivio": make({ sideA: 0.4, sideB: -0.3, liftA: 1.7, liftB: 1.4, bank: -0.1, durationScale: 1.08 }),
  "archivio-atrium": make({ sideA: -0.4, sideB: 0.3, liftA: 1.8, liftB: 1.2, bank: 0.08, durationScale: 1.08 }),
  "atrium-offri": make({ sideA: -0.9, sideB: -0.6, liftA: 1.5, liftB: 1.3, bank: -0.12 }),
  "offri-atrium": make({ sideA: 0.9, sideB: 0.5, liftA: 1.5, liftB: 1.1, bank: 0.12 }),
  "atrium-regole": make({ sideA: 1.2, sideB: 0.9, liftA: 1.4, liftB: 1.2, bank: 0.17 }),
  "regole-atrium": make({ sideA: -1.2, sideB: -0.9, liftA: 1.2, liftB: 1.0, bank: -0.16 }),
  "atrium-rimozione": make({ sideA: 1.6, sideB: 1.2, liftA: 1.1, liftB: 0.9, bank: 0.22 }),
  "rimozione-atrium": make({ sideA: -1.6, sideB: -1.2, liftA: 1.0, liftB: 0.85, bank: -0.21 }),
  "manifesto-archivio": make({ sideA: -0.5, sideB: -0.8, liftA: 1.4, liftB: 1.6, bank: -0.14, durationScale: 1.1 }),
  "archivio-detail": make({ sideA: 1.1, sideB: 0.9, liftA: 0.95, liftB: 1.0, bank: 0.14 }),
  "detail-archivio": make({ sideA: -1.1, sideB: -0.9, liftA: 1.0, liftB: 0.9, bank: -0.14 }),
  "detail-atrium": make({ sideA: -0.8, sideB: -0.3, liftA: 1.7, liftB: 1.4, bank: -0.1, durationScale: 1.14 }),
  "regole-offri": make({ sideA: -0.7, sideB: -0.6, liftA: 1.2, liftB: 1.2, bank: -0.09 }),
  "offri-archivio": make({ sideA: 0.6, sideB: 0.8, liftA: 1.35, liftB: 1.35, bank: 0.11 }),
  "rimozione-regole": make({ sideA: -0.6, sideB: -0.4, liftA: 0.8, liftB: 0.7, bank: -0.08 }),
};

export const getTransitionRail = (splineId: string | null): TransitionRailProfile => {
  if (splineId && TRANSITION_RAILS[splineId]) {
    return TRANSITION_RAILS[splineId];
  }
  return BASE;
};

