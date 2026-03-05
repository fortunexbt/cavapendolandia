import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import AbstractShadow from "@/components/AbstractShadow";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import InitiativeHint from "@/components/InitiativeHint";

const SEAHORSE_SVG = (
  <svg viewBox="0 0 280 240" className="h-32 w-32 md:h-48 md:w-48">
    <path d="M175 35c22 24 30 55 22 88-4 17-15 31-29 39 5 22-3 42-20 60-13 13-28 19-45 17 19-9 30-23 34-43 4-19 0-36-12-50-16-18-24-39-22-62 2-24 14-45 35-60 23-16 50-14 71 11Z" fill="currentColor" className="text-secondary" />
    <polygon points="115,92 146,68 186,74 198,108 167,127 132,117" fill="currentColor" className="text-accent" />
    <polygon points="102,129 129,108 159,133 143,163 111,156" fill="currentColor" className="text-destructive/80" />
    <polygon points="161,150 189,137 203,160 183,187 154,173" fill="currentColor" className="text-ring" />
    <ellipse cx="205" cy="84" rx="18" ry="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/20" />
    <circle cx="208" cy="84" r="5" fill="currentColor" className="text-foreground/40" />
  </svg>
);

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
        <motion.div variants={itemVariants}>
          {SEAHORSE_SVG}
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-8 mb-2 max-w-3xl text-5xl font-light italic leading-[1.2] text-foreground/82 md:text-6xl"
        >
          Che cosa significa Cavapendoli per te?
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="mb-12 font-mono-light text-sm text-muted-foreground/70 md:text-base"
        >
          Un luogo delicato. Prima di lasciare qualcosa, scopri le regole.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-4"
        >
          <Link
            to="/che-cose"
            className="min-w-[18rem] border border-foreground/25 bg-background/60 px-8 py-4 text-base uppercase tracking-[0.2em] font-mono-light hover:-translate-y-0.5 hover:bg-foreground hover:text-primary-foreground"
          >
            Scopri
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-col items-center gap-3"
        >
          <Link
            to="/che-cose"
            className="font-mono-light text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Che cos'è
          </Link>
          <Link
            to="/regole"
            className="font-mono-light text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Regole
          </Link>
          <Link
            to="/rimozione"
            className="font-mono-light text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Rimozione
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
