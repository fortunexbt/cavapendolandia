import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import AbstractShadow from "@/components/AbstractShadow";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import InitiativeHint from "@/components/InitiativeHint";

const MYSTICAL_OPENING = `I Cavapendoli scendono a spirale, quasi veloci.
Prima erano ovunque, nei magazzini del mondo impalpabile.
Lentamente, nel tempo, hanno assunto forma.
Prima immagini, poi dipinti, poi parole.
Ma non si lasciavano fissare volentieri.
Nel tempo che passa, hanno accettato di essere esposti allo sguardo degli estranei.
Ora tentennano, forse non vogliono essere fermati su carta.
Sfuggono, perché vivono di libertà.
Sono bonari, ilari, sfuggenti e spiritosi.
Vanno e vengono, svolacchiano, si posano e se ne vanno.
Chi sa cosa fanno quando non si mostrano.
Li invito con umiltà a entrare nel cannello della penna...
e mi ridacchiano addosso.`;

const SEAHORSE_SVG = (
  <svg viewBox="0 0 280 240" className="h-24 w-24 md:h-48 md:w-48">
    <path d="M175 35c22 24 30 55 22 88-4 17-15 31-29 39 5 22-3 42-20 60-13 13-28 19-45 17 19-9 30-23 34-43 4-19 0-36-12-50-16-18-24-39-22-62 2-24 14-45 35-60 23-16 50-14 71 11Z" fill="currentColor" className="text-secondary" />
    <polygon points="115,92 146,68 186,74 198,108 167,127 132,117" fill="currentColor" className="text-accent" />
    <polygon points="102,129 129,108 159,133 143,163 111,156" fill="currentColor" className="text-destructive/80" />
    <polygon points="161,150 189,137 203,160 183,187 154,173" fill="currentColor" className="text-ring" />
    <ellipse cx="205" cy="84" rx="18" ry="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/20" />
    <circle cx="208" cy="84" r="5" fill="currentColor" className="text-foreground/40" />
  </svg>
);

const DECORATIVE_BORDER = (
  <svg viewBox="0 0 400 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none">
    <path d="M0,10 Q50,0 100,10 T200,10 T300,10 T400,10 M0,90 Q50,100 100,90 T200,90 T300,90 T400,90" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground/20" />
    <circle cx="20" cy="50" r="8" fill="none" stroke="currentColor" className="text-foreground/15" />
    <circle cx="380" cy="50" r="8" fill="none" stroke="currentColor" className="text-foreground/15" />
  </svg>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const Index = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <MinimalHeader />
      <AbstractShadow className="pointer-events-none absolute right-0 top-1/4 h-[22rem] w-28 opacity-45 md:right-6 md:h-[30rem] md:w-40" />
      <AbstractShadow className="pointer-events-none absolute bottom-8 left-0 h-48 w-20 -scale-x-100 opacity-20 md:h-72 md:w-28" />

      <motion.main
        className="relative z-10 flex flex-col items-center justify-center py-16 px-4 text-center w-full max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {DECORATIVE_BORDER}

        <motion.div variants={itemVariants} className="mb-4">
          {SEAHORSE_SVG}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="relative"
        >
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-foreground/20 to-transparent" />
          <div className="absolute -right-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-foreground/20 to-transparent" />
          
          <p className="text-lg md:text-xl italic leading-[1.8] text-foreground/80 font-serif px-6">
            {MYSTICAL_OPENING.split("\n").map((line, i) => (
              <span key={i} className="block mb-1">{line}</span>
            ))}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12">
          <Link
            to="/che-cose"
            className="inline-block border-2 border-foreground/20 bg-background/80 px-10 py-4 text-lg uppercase tracking-[0.25em] font-mono-light hover:bg-foreground hover:text-primary-foreground transition-all duration-300"
          >
            Entra
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-4 w-full max-w-md"
        >
          <Link
            to="/che-cose"
            className="py-3 text-center border border-border/50 hover:border-foreground/30 hover:bg-foreground/5 transition-colors"
          >
            <span className="font-mono-light text-sm">Che cos'è</span>
          </Link>
          <Link
            to="/regole"
            className="py-3 text-center border border-border/50 hover:border-foreground/30 hover:bg-foreground/5 transition-colors"
          >
            <span className="font-mono-light text-sm">Regole</span>
          </Link>
          <Link
            to="/rimozione"
            className="py-3 text-center border border-border/50 hover:border-foreground/30 hover:bg-foreground/5 transition-colors"
          >
            <span className="font-mono-light text-sm">Rimozione</span>
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
