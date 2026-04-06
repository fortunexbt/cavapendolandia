import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import AbstractShadow from "@/components/AbstractShadow";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import InitiativeHint from "@/components/InitiativeHint";
import CavapendoWorld from "@/components/CavapendoWorld";
import { SeahorseIcon } from "@/components/shared/SeahorseIcon";

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--trace)/0.5),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--whisper)/0.28),transparent_38%)]" />
      <CavapendoWorld className="opacity-95" />
      <MinimalHeader />
      <AbstractShadow className="pointer-events-none absolute right-0 top-1/4 h-[22rem] w-28 opacity-55 md:right-6 md:h-[30rem] md:w-40" />
      <AbstractShadow className="pointer-events-none absolute bottom-8 left-0 h-48 w-20 -scale-x-100 opacity-25 md:h-72 md:w-28" />

      <motion.main
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-foreground/10 bg-background/58 px-6 py-8 shadow-[0_40px_120px_rgba(73,48,29,0.16)] backdrop-blur-xl md:px-12 md:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,228,214,0.78),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.26),transparent_48%)]" />
          {DECORATIVE_BORDER}

          <motion.div
            variants={itemVariants}
            className="relative mx-auto mb-5 inline-flex items-center gap-3 rounded-full border border-foreground/15 bg-background/70 px-4 py-2"
          >
            <span className="font-mono-light text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
              Soglia di Cavapendolandia
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/45" />
            <span className="font-mono-light text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
              carta, rame, vento
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-5 flex justify-center">
            <div className="relative">
              <div className="absolute inset-[-14%] rounded-full bg-[radial-gradient(circle,rgba(231,210,184,0.62),transparent_60%)] blur-2xl" />
              <div className="relative text-foreground/95"><SeahorseIcon className="h-24 w-24 md:h-48 md:w-48" /></div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <p className="font-mono-light text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground/75">
              Una soglia esplorabile
            </p>
            <h1 className="mt-3 text-4xl font-light tracking-[0.14em] md:text-6xl">
              CAVAPENDOLANDIA
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base italic text-foreground/70 md:text-lg">
              Una stanza che si apre nel prato, un archivio che respira, una soglia
              dove i cavapendoli si fanno vedere solo per poco.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="relative mt-8">
            <div className="absolute -left-3 bottom-0 top-0 w-px bg-gradient-to-b from-transparent via-foreground/18 to-transparent" />
            <div className="absolute -right-3 bottom-0 top-0 w-px bg-gradient-to-b from-transparent via-foreground/18 to-transparent" />

            <p className="px-3 font-serif text-lg italic leading-[1.82] text-foreground/82 md:px-8 md:text-[1.18rem]">
              {MYSTICAL_OPENING.split("\n").map((line, index) => (
                <span key={index} className="mb-1 block">
                  {line}
                </span>
              ))}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10">
            <Link
              to="/galleria"
              className="inline-flex items-center gap-3 rounded-full border border-foreground/20 bg-foreground px-10 py-4 font-mono-light text-sm uppercase tracking-[0.28em] text-primary-foreground shadow-[0_18px_48px_rgba(55,34,21,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-foreground/90"
            >
              <span>Entra</span>
              <span className="text-base">↗</span>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mx-auto mt-12 grid w-full max-w-lg grid-cols-3 gap-3"
          >
            {[
              { to: "/galleria", label: "Galleria" },
              { to: "/offri", label: "Offri" },
              { to: "/regole", label: "Regole" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-border/50 bg-background/55 py-3 text-center transition-colors hover:border-foreground/30 hover:bg-foreground/5"
              >
                <span className="font-mono-light text-sm">{item.label}</span>
              </Link>
            ))}
          </motion.div>

          <InitiativeHint />
        </div>
      </motion.main>

      <div className="absolute bottom-0 left-0 right-0">
        <MinimalFooter />
      </div>
    </div>
  );
};

export default Index;
