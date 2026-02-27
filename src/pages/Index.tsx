import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AbstractShadow from "@/components/AbstractShadow";
import MinimalFooter from "@/components/MinimalFooter";
import EntraComingSoon from "@/components/EntraComingSoon";

const Index = () => {
  const stagger = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        staggerChildren: 0.16,
      },
    },
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <AbstractShadow className="pointer-events-none absolute right-0 top-1/4 h-[22rem] w-28 opacity-45 md:right-6 md:h-[30rem] md:w-40" />
      <AbstractShadow className="pointer-events-none absolute left-0 bottom-8 h-48 w-20 -scale-x-100 opacity-20 md:h-72 md:w-28" />

      <motion.main
        className="ritual-container relative z-10 flex flex-col items-center justify-center py-20 text-center"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={stagger}
          className="text-sm md:text-base font-mono-light tracking-[0.24em] uppercase text-muted-foreground/70 mb-10"
        >
          CAVAPENDOLANDIA
        </motion.h1>

        <motion.p
          variants={stagger}
          className="max-w-3xl text-4xl md:text-6xl font-light italic text-foreground/82 leading-[1.2] mb-12"
        >
          Che cosa significa Cavapendoli per te?
        </motion.p>

        <motion.p
          variants={stagger}
          className="font-mono-light text-xs md:text-sm text-muted-foreground/70 mb-12"
        >
          Un luogo delicato. Lascia qualcosa che possa stare qui.
        </motion.p>

        <motion.div
          variants={stagger}
          className="flex flex-col sm:flex-row items-center gap-4 md:gap-6"
        >
          <EntraComingSoon
            className="inline-flex min-w-[14rem] items-center justify-center border border-foreground/12 bg-background/50 px-8 py-3 text-sm uppercase tracking-[0.2em] font-mono-light text-muted-foreground/45"
            hint="In arrivo: Entra si apre appena termina la revisione delle offerte."
          />
          <Link
            to="/offri"
            className="min-w-[14rem] border border-foreground/25 bg-background/60 px-8 py-3 text-sm uppercase tracking-[0.2em] font-mono-light hover:bg-foreground hover:text-primary-foreground hover:-translate-y-0.5"
          >
            Lascia un'offerta
          </Link>
        </motion.div>
      </motion.main>

      <div className="absolute bottom-0 left-0 right-0">
        <MinimalFooter />
      </div>
    </div>
  );
};

export default Index;
