import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import AbstractShadow from "@/components/AbstractShadow";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import EntraComingSoon from "@/components/EntraComingSoon";
import InitiativeHint from "@/components/InitiativeHint";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.16,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const Index = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <MinimalHeader />
      <AbstractShadow className="pointer-events-none absolute right-0 top-1/4 h-[22rem] w-28 opacity-45 md:right-6 md:h-[30rem] md:w-40" />
      <AbstractShadow className="pointer-events-none absolute bottom-8 left-0 h-48 w-20 -scale-x-100 opacity-20 md:h-72 md:w-28" />

      <motion.main
        className="ritual-container relative z-10 flex flex-col items-center justify-center py-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={itemVariants}
          className="mb-10 font-mono-light text-sm uppercase tracking-[0.24em] text-muted-foreground/70 md:text-base"
        >
          CAVAPENDOLANDIA
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mb-12 max-w-3xl text-4xl font-light italic leading-[1.2] text-foreground/82 md:text-6xl"
        >
          Che cosa significa Cavapendoli per te?
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="mb-12 font-mono-light text-xs text-muted-foreground/70 md:text-sm"
        >
          Un luogo delicato. Lascia qualcosa che possa stare qui.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-4 sm:flex-row md:gap-6"
        >
          <EntraComingSoon
            className="inline-flex min-w-[14rem] items-center justify-center border border-foreground/12 bg-background/50 px-6 py-3 text-xs uppercase tracking-[0.2em] font-mono-light text-muted-foreground/45"
            hint="In arrivo: Entra si apre appena termina la revisione delle offerte."
          />
          <Link
            to="/offri"
            className="min-w-[14rem] border border-foreground/25 bg-background/60 px-6 py-3 text-xs uppercase tracking-[0.2em] font-mono-light hover:-translate-y-0.5 hover:bg-foreground hover:text-primary-foreground"
          >
            Lascia una cavapendolata
          </Link>
        </motion.div>

        <InitiativeHint />
      </motion.main>

      <div className="absolute bottom-0 left-0 right-0">
        <MinimalFooter />
      </div>
    </div>
  );
};

export default Index;
