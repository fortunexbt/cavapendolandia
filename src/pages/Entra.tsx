import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import OfferingCard from "@/components/OfferingCard";

type Mode = "vaga" | "silenzio";

const fetchApproved = async () => {
  const { data, error } = await supabase
    .from("offerings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

const Entra = () => {
  const [mode, setMode] = useState<Mode>("vaga");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState<number[]>([]);

  const { data: offerings = [], isLoading } = useQuery({
    queryKey: ["offerings-approved"],
    queryFn: fetchApproved,
  });

  // Build shuffled order on first render or when offerings change
  const getShuffledIndex = useCallback(() => {
    if (offerings.length === 0) return 0;
    if (shuffled.length !== offerings.length) {
      const indices = Array.from({ length: offerings.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffled(indices);
      return indices[0];
    }
    return shuffled[currentIndex % shuffled.length];
  }, [offerings.length, shuffled, currentIndex]);

  const next = () => {
    if (offerings.length === 0) return;
    if (shuffled.length === 0) {
      getShuffledIndex();
    }
    setCurrentIndex((prev) => (prev + 1) % offerings.length);
  };

  const currentOffering =
    offerings.length > 0
      ? offerings[
          mode === "vaga"
            ? (shuffled[currentIndex % shuffled.length] ?? currentIndex % offerings.length)
            : currentIndex % offerings.length
        ]
      : null;

  // Initialize shuffle
  if (offerings.length > 0 && shuffled.length === 0) {
    const indices = Array.from({ length: offerings.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffled(indices);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MinimalHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        {/* Mode selector */}
        <nav className="mb-12 flex items-center gap-6">
          {(["vaga", "silenzio"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setCurrentIndex(0);
              }}
              className={`font-mono-light text-xs uppercase tracking-[0.15em] transition-colors duration-500 ${
                mode === m
                  ? "text-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              }`}
            >
              {m === "vaga" ? "Vaga" : "Silenzio"}
            </button>
          ))}
        </nav>

        {isLoading ? (
          <p className="font-mono-light text-muted-foreground/40 animate-pulse">
            ...
          </p>
        ) : offerings.length === 0 ? (
          <div className="text-center">
            <p className="text-lg italic text-muted-foreground/60 mb-8">
              L'archivio è ancora vuoto.
            </p>
            <Link
              to="/offri"
              className="font-mono-light text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Lascia la prima offerta
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${currentIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={`w-full ${mode === "silenzio" ? "max-w-2xl" : "max-w-xl"}`}
            >
              {currentOffering && (
                <OfferingCard
                  id={currentOffering.id}
                  mediaType={currentOffering.media_type}
                  fileUrl={currentOffering.file_url}
                  textContent={currentOffering.text_content}
                  linkUrl={currentOffering.link_url}
                  title={currentOffering.title}
                  note={currentOffering.note}
                  authorType={currentOffering.author_type}
                  authorName={currentOffering.author_name}
                  createdAt={currentOffering.created_at}
                  curatorialNote={currentOffering.curatorial_note}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {offerings.length > 0 && (
          <div className="mt-12 flex items-center gap-8">
            <button
              onClick={next}
              className="font-mono-light text-xs text-muted-foreground hover:text-foreground transition-colors duration-500 underline underline-offset-4"
            >
              un altro
            </button>
            <Link
              to="/offri"
              className="font-mono-light text-xs text-muted-foreground/50 hover:text-foreground transition-colors duration-500"
            >
              lascia un'offerta
            </Link>
          </div>
        )}
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Entra;
