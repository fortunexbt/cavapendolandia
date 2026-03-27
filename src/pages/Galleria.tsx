import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CavapendoGalleryShell from "@/components/CavapendoGalleryShell";
import MinimalHeader from "@/components/MinimalHeader";

const Galleria = () => {
  const navigate = useNavigate();
  const handleExit = useCallback(() => navigate("/grazie"), [navigate]);

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <MinimalHeader />
      <main
        className="flex-1 min-h-0 w-full"
        style={{
          marginTop: "3.5rem",
          height: "calc(100dvh - 3.5rem)",
        }}
      >
        <CavapendoGalleryShell
          className="min-h-[calc(100dvh-3.5rem)] h-full w-full"
          onExit={handleExit}
        />
      </main>
    </div>
  );
};

export default Galleria;
