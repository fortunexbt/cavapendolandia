import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CavapendoGalleryShell from "@/components/CavapendoGalleryShell";
import GalleryHud from "@/components/GalleryHud";

const Galleria = () => {
  const navigate = useNavigate();
  const handleExit = useCallback(() => navigate("/grazie"), [navigate]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0c0908]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(231,214,191,0.22),transparent_30%),radial-gradient(circle_at_15%_40%,rgba(117,85,58,0.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(255,239,214,0.08),transparent_26%),linear-gradient(180deg,rgba(255,247,236,0.07),rgba(12,9,8,0)_22%,rgba(12,9,8,0.28)_100%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-[#ead9c3]/28 to-transparent" />
      <div className="pointer-events-none absolute inset-x-8 bottom-6 h-px bg-gradient-to-r from-transparent via-[#4f3b2d]/45 to-transparent" />
      <div className="pointer-events-none absolute inset-y-10 left-5 w-px bg-gradient-to-b from-transparent via-[#5a4737]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-y-10 right-5 w-px bg-gradient-to-b from-transparent via-[#5a4737]/35 to-transparent" />
      <GalleryHud />
      <main className="relative h-dvh w-full">
        <CavapendoGalleryShell
          className="h-full w-full"
          onExit={handleExit}
        />
      </main>
    </div>
  );
};

export default Galleria;
