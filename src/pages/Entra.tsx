import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const Entra = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-2xl text-center"
        >
          <p className="ritual-step mb-6">Archivio in revisione</p>
          <h1 className="text-4xl md:text-6xl font-light italic text-foreground/86 mb-8">
            Entra torna presto.
          </h1>
          <p className="text-lg text-muted-foreground/80 leading-relaxed mb-10">
            Le offerte stanno entrando una a una. Stiamo revisionando i primi
            contributi prima di aprire il passaggio.
          </p>
          <Link
            to="/offri"
            className="inline-flex rounded-full border border-foreground/25 px-7 py-2 font-mono-light text-xs uppercase tracking-[0.13em] text-foreground/85 hover:bg-foreground hover:text-primary-foreground"
          >
            Lascia un'offerta
          </Link>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Entra;
