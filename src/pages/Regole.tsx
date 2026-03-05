import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const rules = [
  "Cavapendolandia è un luogo delicato.",
  "Lascia solo ciò che ti appartiene o che hai diritto di condividere.",
  "Niente odio, molestie o contenuti violenti espliciti.",
  "Niente dati personali di terzi.",
  "Non è un social: qui non si giudica.",
  "Le cavapendolate entrano dopo una breve attesa.",
  "Ci riserviamo di non pubblicare ciò che non può stare qui.",
];

const Regole = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="max-w-lg text-center"
        >
          <h1 className="text-4xl md:text-5xl font-light mb-10">Regole</h1>

          <ul className="space-y-5 text-left mb-12">
            {rules.map((rule, i) => (
              <li
                key={i}
                className="text-lg leading-relaxed text-foreground/90 pl-5 border-l-2 border-border/50"
              >
                {rule}
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <Link
              to="/offri"
              className="inline-block border-2 border-foreground/20 bg-background/80 px-10 py-4 text-lg uppercase tracking-[0.25em] font-mono-light hover:bg-foreground hover:text-primary-foreground transition-all duration-300"
            >
              Lascia una cavapendolata
            </Link>
          </div>

          <div className="mt-6">
            <Link
              to="/rimozione"
              className="font-mono-light text-base text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              Info rimozione
            </Link>
          </div>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Regole;
