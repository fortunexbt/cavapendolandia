import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import OfferingCard from "@/components/OfferingCard";
import { withSignedFileUrls } from "@/lib/offeringMedia";

type Mode = "vaga" | "nuovi" | "silenzio";

const fetchApproved = async () => {
  const { data, error } = await supabase
    .from("offerings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return withSignedFileUrls(data || []);
};

const Entra = () => {
  const [mode, setMode] = useState<Mode>("vaga");
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: offerings = [], isLoading } = useQuery({
    queryKey: ["offerings-approved"],
    queryFn: fetchApproved,
  });

  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: offerings.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [offerings.length]);

  const next = () => {
    if (offerings.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % offerings.length);
  };

  const currentOffset =
    offerings.length > 0 ? currentIndex % offerings.length : 0;

  const currentDisplayIndex =
    mode === "vaga"
      ? shuffledIndices[currentOffset] ?? currentOffset
      : currentOffset;

  const currentOffering =
    offerings.length > 0
      ? offerings[currentDisplayIndex]
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MinimalHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        {/* Mode selector */}
        <nav className="mb-12 flex items-center gap-6">
          {(["vaga", "nuovi", "silenzio"] as Mode[]).map((m) => (
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
              {m === "vaga" ? "Vaga" : m === "nuovi" ? "Nuovi arrivi" : "Silenzio"}
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
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center">
            <button
              onClick={next}
              className="font-mono-light text-xs text-muted-foreground hover:text-foreground transition-colors duration-500 underline underline-offset-4"
            >
              un altro
            </button>
            {mode === "silenzio" && (
              <p className="font-mono-light text-xs text-muted-foreground/50">
                non devi capire. puoi solo restare.
              </p>
            )}
            <Link
              to="/offri"
              className="font-mono-light text-xs text-muted-foreground/50 hover:text-foreground transition-colors duration-500"
            >
              lascia un'offerta
            </Link>
            <Link
              to="/"
              className="font-mono-light text-xs text-muted-foreground/50 hover:text-foreground transition-colors duration-500"
            >
              torna alla soglia
            </Link>
          </div>
        )}
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Entra;
