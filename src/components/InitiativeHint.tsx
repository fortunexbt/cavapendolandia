import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useActiveInitiative } from "@/hooks/useActiveInitiative";

const InitiativeHint = () => {
  const { t } = useTranslation();
  const { data: initiative, isLoading } = useActiveInitiative();

  if (isLoading || !initiative) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8 rounded-xl border border-accent/30 bg-accent/10 px-5 py-4 text-center"
    >
      <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-accent mb-2">
        {t("index.initiativePrompt")}
      </p>
      <p className="text-sm italic text-foreground/90 leading-relaxed">
        {initiative.prompt}
      </p>
      {initiative.details && (
        <p className="mt-2 text-xs text-muted-foreground">{initiative.details}</p>
      )}
    </motion.div>
  );
};

export default InitiativeHint;
