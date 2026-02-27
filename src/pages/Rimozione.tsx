import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import { resolveJourneyForPage } from "@/lib/worldJourney";

const CavapendoliWorldCanvas = lazy(() => import("@/components/CavapendoliWorldCanvas"));

const Rimozione = () => {
  const pageJourney = resolveJourneyForPage(0.96, 0.48);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c1118] text-[#f5eddc]">
      <Suspense fallback={null}>
        <CavapendoliWorldCanvas mode="silenzio" journey={pageJourney} />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(98,127,166,0.24),transparent_46%),radial-gradient(circle_at_78%_24%,rgba(209,133,91,0.2),transparent_44%),linear-gradient(180deg,rgba(9,11,16,0.62),rgba(8,10,15,0.9))]" />

      <MinimalHeader immersive />

      <main className="relative z-10 flex min-h-screen items-center px-6 pb-10 pt-32 md:px-10 md:pt-36">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/20 bg-black/40 p-7 text-center backdrop-blur-xl md:p-10"
        >
          <p className="font-mono-light text-[0.66rem] uppercase tracking-[0.2em] text-[#d3dae5]">
            Cura del luogo
          </p>
          <h1 className="mt-4 text-5xl font-light italic text-[#faf1e1] md:text-6xl">Rimozione</h1>

          <p className="mt-8 text-lg leading-relaxed text-[#e6ddce]">
            Se hai caricato qualcosa e desideri rimuoverlo, scrivi a:
          </p>
          <a
            href="mailto:cavapendoli@gmail.com"
            className="mt-3 inline-block rounded-full border border-[#e1bd6a] px-6 py-2 font-mono-light text-sm uppercase tracking-[0.14em] text-[#fff1d9] transition hover:bg-[#e1bd6a] hover:text-[#1e1b17]"
          >
            cavapendoli@gmail.com
          </a>
          <p className="mt-5 text-sm leading-relaxed text-[#c6d0de]">
            Indica data, titolo (se presente) e un dettaglio per riconoscerlo.
          </p>
        </motion.section>
      </main>

      <div className="relative z-10">
        <MinimalFooter />
      </div>
    </div>
  );
};

export default Rimozione;
