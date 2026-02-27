import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import { resolveJourneyForPage } from "@/lib/worldJourney";

const CavapendoliWorldCanvas = lazy(() => import("@/components/CavapendoliWorldCanvas"));

const CheCose = () => {
  const pageJourney = resolveJourneyForPage(0.14, 0.45);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d1219] text-[#f5eddc]">
      <Suspense fallback={null}>
        <CavapendoliWorldCanvas mode="soglia" journey={pageJourney} />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_15%,rgba(244,186,82,0.2),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(77,172,194,0.22),transparent_46%),linear-gradient(180deg,rgba(9,11,16,0.58),rgba(8,10,15,0.86))]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_52px)]" />

      <MinimalHeader immersive />

      <main className="relative z-10 flex min-h-screen items-center px-6 pb-12 pt-32 md:px-10 md:pt-36">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/20 bg-black/35 p-7 backdrop-blur-xl md:p-10"
        >
          <p className="font-mono-light text-[0.66rem] uppercase tracking-[0.2em] text-[#d3dae5]">
            Manifesto
          </p>
          <h1 className="mt-4 text-5xl font-light italic text-[#faf1e1] md:text-6xl">Che cos&apos;e</h1>

          <div className="mt-8 space-y-4 text-lg leading-relaxed text-[#e9e0d0]">
            <p>Cavapendolandia e un luogo semplice.</p>
            <p>
              Qui le persone lasciano un&apos;offerta: un&apos;immagine, un suono, un testo, un frammento.
            </p>
            <p className="text-2xl italic text-[#fff4e0]">
              La domanda e una sola: che cosa significa Cavapendoli per te?
            </p>
            <p>Non troverai risposte giuste. Troverai tracce.</p>
            <p>Entra, vaga, torna quando vuoi.</p>
          </div>

          <p className="mt-8 rounded-xl border border-white/15 bg-black/25 p-4 font-mono-light text-xs uppercase tracking-[0.12em] text-[#c7d1de]">
            Cavapendoli e un nome nato dal lavoro di un artista e psicoanalista. Qui diventa eco condivisa.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/entra"
              className="inline-flex min-w-[11rem] justify-center rounded-full border border-[#6ec9d3] bg-black/40 px-6 py-2.5 font-mono-light text-xs uppercase tracking-[0.15em] text-[#e8f7ff] transition hover:-translate-y-0.5 hover:bg-[#4ab7c8] hover:text-[#11181d]"
            >
              Entra
            </Link>
            <Link
              to="/offri"
              className="font-mono-light text-xs uppercase tracking-[0.15em] text-[#f0dbba] underline underline-offset-4"
            >
              Lascia un&apos;offerta
            </Link>
          </div>
        </motion.section>
      </main>

      <div className="relative z-10">
        <MinimalFooter />
      </div>
    </div>
  );
};

export default CheCose;
