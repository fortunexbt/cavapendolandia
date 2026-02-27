import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import { resolveJourneyForPage } from "@/lib/worldJourney";

const CavapendoliWorldCanvas = lazy(() => import("@/components/CavapendoliWorldCanvas"));

const rules = [
  "Cavapendolandia e un luogo delicato.",
  "Lascia solo cio che ti appartiene o che hai diritto di condividere.",
  "Niente odio, molestie o contenuti violenti espliciti.",
  "Niente dati personali di terzi.",
  "Non e un social: qui non si giudica.",
  "Le offerte entrano dopo una breve attesa.",
  "Ci riserviamo di non pubblicare cio che non puo stare qui.",
];

const Regole = () => {
  const pageJourney = resolveJourneyForPage(0.91, 0.45);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c1118] text-[#f5eddc]">
      <Suspense fallback={null}>
        <CavapendoliWorldCanvas mode="silenzio" journey={pageJourney} />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(98,127,166,0.24),transparent_46%),radial-gradient(circle_at_78%_24%,rgba(209,133,91,0.2),transparent_44%),linear-gradient(180deg,rgba(9,11,16,0.6),rgba(8,10,15,0.88))]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_52px)]" />

      <MinimalHeader immersive />

      <main className="relative z-10 flex min-h-screen items-center px-6 pb-12 pt-32 md:px-10 md:pt-36">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/20 bg-black/35 p-7 backdrop-blur-xl md:p-10"
        >
          <p className="font-mono-light text-[0.66rem] uppercase tracking-[0.2em] text-[#d3dae5]">
            Patto del luogo
          </p>
          <h1 className="mt-4 text-5xl font-light italic text-[#faf1e1] md:text-6xl">Regole</h1>

          <ul className="mt-8 grid gap-3">
            {rules.map((rule, i) => (
              <li
                key={rule}
                className="rounded-xl border border-white/14 bg-black/22 px-4 py-3 text-base text-[#e6ddce]"
              >
                <span className="mr-3 font-mono-light text-xs uppercase tracking-[0.15em] text-[#a7b9cc]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {rule}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/offri"
              className="inline-flex min-w-[11rem] justify-center rounded-full border border-[#e0bd6b] bg-black/40 px-6 py-2.5 font-mono-light text-xs uppercase tracking-[0.15em] text-[#fff4de] transition hover:-translate-y-0.5 hover:bg-[#ebc06a] hover:text-[#191713]"
            >
              Lascia un&apos;offerta
            </Link>
            <Link
              to="/rimozione"
              className="font-mono-light text-xs uppercase tracking-[0.15em] text-[#c7d1de] underline underline-offset-4"
            >
              Rimozione
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

export default Regole;
