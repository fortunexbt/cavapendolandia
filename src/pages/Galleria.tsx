import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CavapendoGallery from "@/components/CavapendoGallery";
import MinimalHeader from "@/components/MinimalHeader";

const Galleria = () => {
  const navigate = useNavigate();
  const handleExit = useCallback(() => navigate("/grazie"), [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <MinimalHeader />
      <main className="flex-1 w-full" style={{ marginTop: "3.5rem" }}>
        <CavapendoGallery className="h-[calc(100vh-3.5rem)] w-full" onExit={handleExit} />
      </main>
    </div>
  );
};

export default Galleria;