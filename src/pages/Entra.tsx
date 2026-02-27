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

  const wanderPulse = currentOffset % 3;

  const currentOffering =
    offerings.length > 0
      ? offerings[currentDisplayIndex]
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MinimalHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        {/* Mode selector */}
        <nav className="mb-12 flex flex-wrap items-center justify-center gap-3">
          {(["vaga", "nuovi", "silenzio"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setCurrentIndex(0);
              }}
              className={`rounded-full border px-4 py-2 font-mono-light text-[0.68rem] uppercase tracking-[0.15em] transition-all ${
                mode === m
                  ? "text-foreground border-foreground/30 bg-background/80"
                  : "text-muted-foreground/60 border-border/60 hover:text-foreground hover:border-foreground/30"
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
          <div className="text-center ritual-container">
            <p className="text-2xl italic text-foreground/70 mb-8">
              Qui non c'è ancora nulla.
            </p>
            <Link
              to="/offri"
              className="inline-flex rounded-full border border-foreground/25 px-6 py-2 font-mono-light text-xs uppercase tracking-[0.13em] text-muted-foreground hover:text-foreground hover:border-foreground/40"
            >
              Lascia la prima offerta
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${currentIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className={`w-full ${mode === "silenzio" ? "max-w-3xl min-h-[58vh] flex items-center" : "max-w-xl"}`}
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
          <div className="mt-12 flex flex-col items-center gap-5 text-center">
            {mode !== "silenzio" && (
              <div className="flex items-center justify-center gap-1.5" aria-hidden>
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      wanderPulse === index ? "bg-foreground/65 scale-110" : "bg-foreground/20"
                    }`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={next}
              className="rounded-full border border-foreground/25 px-7 py-2 font-mono-light text-xs uppercase tracking-[0.13em] text-foreground/85 hover:bg-foreground hover:text-primary-foreground"
            >
              un altro
            </button>
            {mode === "silenzio" && (
              <p className="font-mono-light text-xs text-muted-foreground/60">
                resta finché vuoi.
              </p>
            )}
            <div className="flex items-center justify-center gap-8">
              <Link
                to="/offri"
                className="font-mono-light text-xs text-muted-foreground/70 hover:text-foreground transition-colors duration-500"
              >
                lascia un'offerta
              </Link>
              {mode !== "silenzio" && (
                <Link
                  to="/"
                  className="font-mono-light text-xs text-muted-foreground/60 hover:text-foreground transition-colors duration-500"
                >
                  torna alla soglia
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Entra;
