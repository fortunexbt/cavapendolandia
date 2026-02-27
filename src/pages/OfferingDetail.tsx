import { lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import OfferingCard from "@/components/OfferingCard";
import { motion } from "framer-motion";
import { withSignedFileUrl } from "@/lib/offeringMedia";
import EntraComingSoon from "@/components/EntraComingSoon";
import { resolveJourneyForPage } from "@/lib/worldJourney";

const CavapendoliWorldCanvas = lazy(() => import("@/components/CavapendoliWorldCanvas"));

const OfferingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const pageJourney = resolveJourneyForPage(0.62, 0.52);

  const { data: offering, isLoading } = useQuery({
    queryKey: ["offering", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select("*")
        .eq("id", id!)
        .eq("status", "approved")
        .single();
      if (error) throw error;
      return withSignedFileUrl(data);
    },
    enabled: !!id,
  });

  // Fetch a random offering for "un altro"
  const { data: randomOffering } = useQuery({
    queryKey: ["random-offering", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select("id")
        .eq("status", "approved")
        .neq("id", id!)
        .limit(50);
      if (error || !data?.length) return null;
      return data[Math.floor(Math.random() * data.length)];
    },
    enabled: !!id,
  });

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background/90">
      <Suspense fallback={null}>
        <CavapendoliWorldCanvas mode="vaga" journey={pageJourney} className="opacity-62" />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(244,240,233,0.84),rgba(244,240,233,0.94))]" />
      <MinimalHeader immersive />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        {isLoading ? (
          <p className="font-mono-light text-muted-foreground/40 animate-pulse">...</p>
        ) : !offering ? (
          <div className="text-center">
            <p className="text-lg italic text-muted-foreground/60 mb-4">Offerta non trovata.</p>
            <EntraComingSoon
              label="torna all'Archivio"
              className="font-mono-light text-muted-foreground/45 underline underline-offset-4"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="ritual-container max-w-3xl"
          >
            <p className="ritual-label text-center mb-8">Offerta trovata</p>
            <OfferingCard
              id={offering.id}
              mediaType={offering.media_type}
              fileUrl={offering.file_url}
              textContent={offering.text_content}
              linkUrl={offering.link_url}
              title={offering.title || "Offerta"}
              note={offering.note}
              authorType={offering.author_type}
              authorName={offering.author_name}
              createdAt={offering.created_at}
              curatorialNote={offering.curatorial_note}
              full
            />

            <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
              {randomOffering && (
                <Link
                  to={`/o/${randomOffering.id}`}
                  className="rounded-full border border-foreground/25 px-7 py-2 font-mono-light text-xs uppercase tracking-[0.13em] text-foreground/85 hover:bg-foreground hover:text-primary-foreground"
                >
                  un altro
                </Link>
              )}
              <EntraComingSoon
                label="torna all'Archivio"
                className="font-mono-light text-xs text-muted-foreground/45"
              />
              <Link
                to="/offri"
                className="font-mono-light text-xs text-muted-foreground/65 hover:text-foreground transition-colors"
              >
                lascia un'offerta
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      <MinimalFooter />
    </div>
  );
};

export default OfferingDetail;
