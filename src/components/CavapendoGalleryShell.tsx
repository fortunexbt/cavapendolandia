import { useEffect, useState, type ComponentType } from "react";
import { preloadCavapendoGalleryAssets } from "@/components/cavapendo-gallery/assets";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDeviceClass } from "@/components/cavapendo-gallery/runtime";
import { PreloadOverlay } from "@/components/cavapendo-gallery/overlays";

type GallerySurfaceProps = {
  className?: string;
  onExit?: () => void;
};

type GalleryModule = {
  default: ComponentType<GallerySurfaceProps>;
};

const LOADING_STAGES = [
  "Carico il bundle della galleria",
  "Scaldo superfici e materiali",
  "Precarico l'ambiente sonoro",
  "Stabilizzo il primo frame",
] as const;

const waitForAnimationFrames = async (count: number) => {
  for (let index = 0; index < count; index += 1) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
};

const CavapendoGalleryShell = ({
  className = "",
  onExit,
}: GallerySurfaceProps) => {
  const isMobile = useIsMobile();
  const [SurfaceComponent, setSurfaceComponent] =
    useState<ComponentType<GallerySurfaceProps> | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadError(null);
        setLoadingStage(0);
        const module =
          (await import("@/components/CavapendoGallery")) as GalleryModule;
        if (cancelled) return;

        setLoadingStage(1);
        const preloadPromise = preloadCavapendoGalleryAssets(
          getDeviceClass(isMobile),
        ).catch((error) => {
          console.warn("[Galleria] Asset warmup skipped:", error);
        });

        setLoadingStage(2);
        await waitForAnimationFrames(2);
        if (cancelled) return;

        setLoadingStage(3);
        setSurfaceComponent(() => module.default);
        await Promise.race([preloadPromise, waitForAnimationFrames(1)]);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "Errore di caricamento",
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isMobile]);

  if (loadError) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#110d0c] px-4">
          <div className="max-w-lg rounded-[2rem] border border-[#4f4036] bg-[#150f0d]/94 px-6 py-8 text-[#f7eee4] shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            <div className="text-[0.68rem] uppercase tracking-[0.22em] text-[#cdb69d]">
              Caricamento interrotto
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#eadccc]">
              {loadError}. Ricarica la pagina per ricostruire il mondo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!SurfaceComponent) {
    return (
      <div className={`relative w-full ${className}`}>
        <PreloadOverlay
          stageLabel={
            LOADING_STAGES[loadingStage] ||
            LOADING_STAGES[LOADING_STAGES.length - 1]
          }
          stageIndex={loadingStage + 1}
          totalStages={LOADING_STAGES.length}
        />
      </div>
    );
  }

  return <SurfaceComponent className={className} onExit={onExit} />;
};

export default CavapendoGalleryShell;
