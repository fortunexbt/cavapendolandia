import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const Grazie = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <MinimalHeader />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="flex-1 flex items-center justify-center"
      >
        <div className="text-center px-6 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <p className="text-4xl mb-6">🏛️</p>
            <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-foreground mb-4">
              Grazie per la visita
            </h1>
            <p className="text-lg text-muted-foreground font-serif italic leading-relaxed mb-2">
              Hai attraversato la Galleria di Cavapendolandia.
            </p>
            <p className="text-base text-muted-foreground/70 font-serif leading-relaxed mb-8">
              Le cavapendolate restano appese, in attesa del prossimo viaggiatore.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-mono-light text-sm"
            >
              Torna all'inizio
            </Link>
            <Link
              to="/galleria"
              className="inline-block border border-border px-6 py-3 rounded-md hover:bg-accent transition-colors font-mono-light text-sm text-foreground"
            >
              Rientra nella Galleria
            </Link>
          </motion.div>
        </div>
      </motion.main>

      <MinimalFooter />
    </div>
  );
};

export default Grazie;
