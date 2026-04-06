import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "@/components/shared/PageLayout";

const CheCose = () => {
  return (
    <PageLayout>
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg text-center space-y-10"
        >
          <h1 className="text-4xl font-light md:text-5xl">Che cos'è</h1>

          <div className="space-y-6">
            <p className="text-xl leading-relaxed text-foreground/90">
              Un luogo dove lasciare qualcosa.
            </p>
            <p className="text-xl leading-relaxed text-foreground/90">
              Un'immagine, un suono, un testo, un frammento.
            </p>
            <p className="text-2xl italic text-foreground/90">
              La domanda: cosa significa Cavapendoli per te?
            </p>
            <p className="text-xl leading-relaxed text-foreground/90">
              Non ci sono risposte giuste. Solo tracce.
            </p>
          </div>

          <div className="pt-8">
            <Link
              to="/regole"
              className="inline-block border-2 border-foreground/20 bg-background/80 px-10 py-4 text-lg uppercase tracking-[0.25em] font-mono-light hover:bg-foreground hover:text-primary-foreground transition-all duration-300"
            >
              Leggi le regole
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 pt-4">
            <Link
              to="/rimozione"
              className="font-mono-light text-base text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              Info rimozione
            </Link>
          </div>
        </motion.div>
      </main>
    </PageLayout>
  );
};

export default CheCose;
