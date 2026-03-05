import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const Rimozione = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-md text-center space-y-6"
        >
          <h1 className="text-3xl font-light mb-8">Rimozione</h1>

          <p className="text-base leading-relaxed text-foreground/80">
            Se hai caricato qualcosa e desideri rimuoverlo, scrivi a:
          </p>
          <a
            href="mailto:cavapendoli@gmail.com"
            className="font-mono-light text-foreground/70 hover:text-foreground"
          >
            cavapendoli@gmail.com
          </a>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Indica data, titolo (se presente) e un dettaglio per riconoscerlo.
          </p>

          <div className="pt-8">
            <Link
              to="/offri"
              className="font-mono-light text-base text-foreground hover:text-foreground transition-colors"
            >
              Lascia una cavapendolata →
            </Link>
          </div>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Rimozione;
