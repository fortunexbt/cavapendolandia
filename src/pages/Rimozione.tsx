import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const Rimozione = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-md text-center space-y-8"
        >
          <h1 className="text-4xl font-light mb-8">Rimozione</h1>

          <p className="text-xl leading-relaxed text-foreground/90">
            Se hai caricato qualcosa e desideri rimuoverlo, scrivi a:
          </p>
          <a
            href="mailto:cavapendoli@gmail.com"
            className="inline-block text-xl font-mono-light text-foreground/80 hover:text-foreground underline underline-offset-4"
          >
            cavapendoli@gmail.com
          </a>
          <p className="text-lg leading-relaxed text-muted-foreground/80">
            Indica data, titolo (se presente) e un dettaglio per riconoscerlo.
          </p>

          <div className="pt-8">
            <Link
              to="/offri"
              className="font-mono-light text-lg text-foreground hover:text-foreground transition-colors"
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
