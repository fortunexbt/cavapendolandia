import { useState, useCallback, useEffect, useRef } from "react";

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenTarget = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

const getActiveFullscreenElement = (ownerDocument: Document = document) => {
  const fullscreenDocument = ownerDocument as FullscreenDocument;
  return (
    ownerDocument.fullscreenElement ||
    fullscreenDocument.webkitFullscreenElement ||
    null
  );
};

const requestElementFullscreen = async (element: HTMLElement) => {
  const fullscreenTarget = element as FullscreenTarget;
  if (fullscreenTarget.requestFullscreen) {
    await fullscreenTarget.requestFullscreen();
    return;
  }
  if (fullscreenTarget.webkitRequestFullscreen) {
    await fullscreenTarget.webkitRequestFullscreen();
  }
};

const exitElementFullscreen = async (ownerDocument: Document = document) => {
  const fullscreenDocument = ownerDocument as FullscreenDocument;
  if (ownerDocument.exitFullscreen) {
    await ownerDocument.exitFullscreen();
    return;
  }
  if (fullscreenDocument.webkitExitFullscreen) {
    await fullscreenDocument.webkitExitFullscreen();
  }
};

export interface UseFullscreenOptions {
  isMobile?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
}

export interface UseFullscreenResult {
  isFullscreen: boolean;
  enterFullscreen: (element: HTMLElement) => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: (element: HTMLElement) => Promise<void>;
}

export function useFullscreen(
  options: UseFullscreenOptions = {},
): UseFullscreenResult {
  const { isMobile = false, viewportWidth = 0, viewportHeight = 0 } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeFullscreenElement = getActiveFullscreenElement();
      setIsFullscreen(Boolean(activeFullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange as EventListener,
    );
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange as EventListener,
      );
    };
  }, []);

  const enterFullscreen = useCallback(
    async (element: HTMLElement) => {
      setIsFullscreen(true);
      await requestElementFullscreen(element);
      if (isMobile && viewportWidth < viewportHeight) {
        await screen.orientation?.lock?.("landscape").catch(() => undefined);
      }
    },
    [isMobile, viewportHeight, viewportWidth],
  );

  const exitFullscreen = useCallback(async () => {
    setIsFullscreen(false);
    await exitElementFullscreen();
    screen.orientation?.unlock?.();
  }, []);

  const toggleFullscreen = useCallback(
    async (element: HTMLElement) => {
      const wrapper = element;
      const fullscreenElement = getActiveFullscreenElement();

      if (
        fullscreenElement &&
        (fullscreenElement === wrapper ||
          fullscreenElement.contains(wrapper))
      ) {
        await exitFullscreen();
      } else {
        await enterFullscreen(element);
      }
    },
    [enterFullscreen, exitFullscreen],
  );

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
