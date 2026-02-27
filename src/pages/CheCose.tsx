import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const CheCose = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MinimalHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-md text-center space-y-6"
        >
          <h1 className="text-3xl font-light mb-8">Che cos'è</h1>

          <p className="text-base leading-relaxed text-foreground/80">
            Cavapendolandia è un luogo semplice.
          </p>
          <p className="text-base leading-relaxed text-foreground/80">
            Qui le persone lasciano un'offerta: un'immagine, un suono, un testo,
            un frammento.
          </p>
          <p className="text-base leading-relaxed text-foreground/80 italic">
            La domanda è una sola: che cosa significa Cavapendoli per te?
          </p>
          <p className="text-base leading-relaxed text-foreground/80">
            Non troverai risposte giuste. Troverai tracce.
          </p>
          <p className="text-base leading-relaxed text-foreground/80">
            Entra, vaga, torna quando vuoi.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground mt-4">
            Cavapendoli è un nome nato dal lavoro di un artista e psicoanalista.
            Qui diventa eco condivisa.
          </p>

          <div className="pt-8 flex items-center justify-center gap-8">
            <Link
              to="/entra"
              className="font-mono-light text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Entra
            </Link>
            <Link
              to="/offri"
              className="font-mono-light text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Lascia un'offerta
            </Link>
          </div>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default CheCose;
