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

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="max-w-2xl text-center"
        >
          <h1 className="text-4xl md:text-5xl font-light mb-12">Regole del luogo</h1>

          <ul className="space-y-5 text-left">
            {rules.map((rule, i) => (
              <li
                key={i}
                className="text-lg leading-relaxed text-foreground/82 pl-5 border-l border-border/55"
              >
                {rule}
              </li>
            ))}
          </ul>

          <div className="pt-10">
            <Link
              to="/offri"
              className="font-mono-light text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Lascia una cavapendolata
            </Link>
          </div>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Regole;
