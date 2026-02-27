import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AbstractShadow from "@/components/AbstractShadow";
import MinimalFooter from "@/components/MinimalFooter";

const Index = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Abstract shadow at the edge */}
      <AbstractShadow className="absolute right-4 top-1/4 w-24 h-72 opacity-30 md:right-16 md:w-32 md:h-96" />
      
      <motion.main
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] uppercase mb-12">
          CAVAPENDOLANDIA
        </h1>

        <p className="text-xl md:text-2xl font-light italic text-foreground/70 max-w-lg mb-16 leading-relaxed">
          Che cosa significa Cavapendoli per te?
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
          <Link
            to="/entra"
            className="px-8 py-3 border border-foreground/20 text-sm uppercase tracking-[0.2em] font-mono-light hover:bg-foreground hover:text-primary-foreground transition-all duration-700"
          >
            Entra
          </Link>
          <Link
            to="/offri"
            className="px-8 py-3 border border-foreground/20 text-sm uppercase tracking-[0.2em] font-mono-light hover:bg-foreground hover:text-primary-foreground transition-all duration-700"
          >
            Lascia un'offerta
          </Link>
        </div>

        <motion.p
          className="font-mono-light text-muted-foreground/40 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 2 }}
        >
          Qui si lascia qualcosa. E si vaga.
        </motion.p>
      </motion.main>

      <div className="absolute bottom-0 left-0 right-0">
        <MinimalFooter />
      </div>
    </div>
  );
};

export default Index;
