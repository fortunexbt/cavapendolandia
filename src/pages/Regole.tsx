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
  "Le offerte entrano dopo una breve attesa.",
  "Ci riserviamo di non pubblicare ciò che non può stare qui.",
];

const Regole = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MinimalHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-md text-center"
        >
          <h1 className="text-3xl font-light mb-10">Regole del luogo</h1>

          <ul className="space-y-4 text-left">
            {rules.map((rule, i) => (
              <li
                key={i}
                className="text-base leading-relaxed text-foreground/80 pl-4 border-l border-border/50"
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
              Lascia un'offerta
            </Link>
          </div>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Regole;
