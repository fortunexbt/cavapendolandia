import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import EntraComingSoon from "@/components/EntraComingSoon";

const MYSTICAL_QUOTE = `I Cavapendoli scendono a spirale, quasi veloci. Prima erano ovunque, nei magazzini del mondo impalpabile. Lentamente, nel tempo, hanno assunto forma: prima immagini, poi dipinti, poi parole.
Ma non si lasciavano fissare volentieri.
Nel tempo che passa, hanno accettato di essere esposti allo sguardo degli estranei. Ora tentennano, forse non vogliono essere fermati su carta.
Sfuggono, perché vivono di libertà.
Sono bonari, ilari, sfuggenti e spiritosi. Vanno e vengono, svolacchiano, si posano e se ne vanno.
Chi sa cosa fanno quando non si mostrano.
Li invito con umiltà a entrare nel cannello della penna... e mi ridacchiano addosso.`;

const CheCose = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-center space-y-8"
        >
          <h1 className="text-4xl font-light mb-10 md:text-5xl">Che cos'è</h1>

          <p className="text-xl leading-relaxed text-foreground/80">
            Un luogo semplice dove lasciare qualcosa.
          </p>
          <p className="text-xl leading-relaxed text-foreground/80">
            Un'immagine, un suono, un testo, un frammento.
          </p>
          <p className="text-2xl italic text-foreground/80">
            La domanda: che cosa significa Cavapendoli per te?
          </p>
          <p className="text-xl leading-relaxed text-foreground/80">
            Non troverai risposte giuste. Solo tracce.
          </p>

          <div className="pt-8 flex items-center justify-center gap-8">
            <EntraComingSoon className="font-mono-light text-sm text-muted-foreground/45" />
            <Link
              to="/offri"
              className="font-mono-light text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Lascia una cavapendolata
            </Link>
          </div>

          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-12 text-sm italic text-muted-foreground/50 leading-relaxed border-t border-border/30 mt-12 px-4"
          >
            {MYSTICAL_QUOTE.split("\n\n").map((para, i) => (
              <p key={i} className="mb-3">{para}</p>
            ))}
          </motion.blockquote>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default CheCose;
