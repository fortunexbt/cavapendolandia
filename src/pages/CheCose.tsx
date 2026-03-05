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
          transition={{ duration: 0.35 }}
          className="max-w-2xl text-center space-y-7"
        >
          <h1 className="text-4xl md:text-5xl font-light mb-10">Che cos'è</h1>

          <p className="text-lg leading-relaxed text-foreground/80">
            Cavapendolandia è un luogo semplice.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            Qui le persone lasciano una cavapendolata: un'immagine, un suono, un testo,
            un frammento.
          </p>
          <p className="text-xl leading-relaxed text-foreground/80 italic">
            La domanda è una sola: che cosa significa Cavapendoli per te?
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            Non troverai risposte giuste. Troverai tracce.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            Entra, vaga, torna quando vuoi.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground mt-5 font-mono-light">
            Cavapendoli è un nome nato dal lavoro di un artista e psicoanalista.
            Qui diventa eco condivisa.
          </p>

          <div className="pt-8 flex items-center justify-center gap-8">
            <EntraComingSoon className="font-mono-light text-xs text-muted-foreground/45 underline underline-offset-4" />
            <Link
              to="/offri"
              className="font-mono-light text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
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
