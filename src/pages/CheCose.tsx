import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import EntraComingSoon from "@/components/EntraComingSoon";

const CheCose = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-center space-y-8"
        >
          <h1 className="text-4xl font-light mb-10 md:text-5xl">Che cos'è</h1>

          <p className="text-xl leading-relaxed text-foreground/80">
            Un luogo semplice dove lasciare qualcosa.
          </p>
          <p className="text-xl leading-relaxed text-foreground/80">
            Un'immagine, un suono, un testo, un frammento.
          </p>
          <p className="text-2xl italic text-foreground/80">
            La domanda: che cosa significa Cavapendoli per te?
          </p>
          <p className="text-xl leading-relaxed text-foreground/80">
            Non troverai risposte giuste. Solo tracce.
          </p>

          <div className="pt-8 flex items-center justify-center gap-8">
            <EntraComingSoon className="font-mono-light text-sm text-muted-foreground/45" />
            <Link
              to="/offri"
              className="font-mono-light text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Lascia una cavapendolata
            </Link>
          </div>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default CheCose;
