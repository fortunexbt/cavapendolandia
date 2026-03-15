import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CavapendoGallery from "@/components/CavapendoGallery";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const Galleria = () => {
  const navigate = useNavigate();
  const handleExit = useCallback(() => navigate("/grazie"), [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <MinimalHeader />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1"
      >
        <div className="container mx-auto px-4 pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-foreground mb-2">
              La Galleria
            </h1>
            <p className="text-lg text-muted-foreground font-serif italic">
              Le cavapendolate lasciate da altri viaggiatori
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="border border-border/30 rounded-lg overflow-hidden"
            style={{ height: "70vh", minHeight: "500px" }}
          >
            <CavapendoGallery className="h-full w-full" onExit={handleExit} />
          </motion.div>
        </div>
      </motion.main>
      
      <MinimalFooter />
    </div>
  );
};

export default Galleria;