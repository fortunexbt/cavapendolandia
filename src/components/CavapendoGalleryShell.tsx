import { useEffect, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
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

const LOADING_STAGE_KEYS = [
  "gallery.shell.loadingStage0",
  "gallery.shell.loadingStage1",
  "gallery.shell.loadingStage2",
  "gallery.shell.loadingStage3",
] as const;

const LOAD_TIMEOUT_MS = 30_000;

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
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [SurfaceComponent, setSurfaceComponent] =
    useState<ComponentType<GallerySurfaceProps> | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadResolved = false;

    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !loadResolved) {
        setLoadError(
          t(
            "gallery.shell.loadTimeout",
            "Il caricamento sta impiegando troppo. Ricarica la pagina.",
          ),
        );
      }
    }, LOAD_TIMEOUT_MS);

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
        loadResolved = true;
        window.clearTimeout(timeoutId);
        setSurfaceComponent(() => module.default);
        await Promise.race([preloadPromise, waitForAnimationFrames(1)]);
      } catch (error) {
        window.clearTimeout(timeoutId);
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : t("gallery.shell.loadError"),
        );
      }
    };

    load();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isMobile, t]);

  if (loadError) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#110d0c] px-4">
          <div className="max-w-lg rounded-[2rem] border border-[#4f4036] bg-[#150f0d]/94 px-6 py-8 text-[#f7eee4] shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            <div className="text-[0.68rem] uppercase tracking-[0.22em] text-[#cdb69d]">
              {t("gallery.shell.loadErrorTitle")}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#eadccc]">
              {loadError}. {t("gallery.shell.loadErrorRetry")}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full border border-[#6b5544] bg-[#2a1f18] px-8 py-3 text-xs uppercase tracking-[0.2em] text-[#f0dfc7] transition-colors hover:bg-[#3a2e24]"
            >
              {t("gallery.shell.reload", "Ricarica")}
            </button>
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
            t(LOADING_STAGE_KEYS[loadingStage] ||
            LOADING_STAGE_KEYS[LOADING_STAGE_KEYS.length - 1])
          }
          stageIndex={loadingStage + 1}
          totalStages={LOADING_STAGE_KEYS.length}
        />
      </div>
    );
  }

  return <SurfaceComponent className={className} onExit={onExit} />;
};

export default CavapendoGalleryShell;
