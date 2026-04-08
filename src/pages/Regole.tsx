import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/shared/PageLayout";
import { usePageBlocks } from "@/features/content/hooks/usePageBlocks";

const FALLBACK_RULES_KEYS = [
  "regole.rule0",
  "regole.rule1",
  "regole.rule2",
  "regole.rule3",
  "regole.rule4",
  "regole.rule5",
  "regole.rule6",
];

const Regole = () => {
  const { t } = useTranslation();
  const { getBlock } = usePageBlocks("regole");

  const titleBlock = getBlock("title");
  const title = titleBlock?.body_text ?? t("regole.title");

  // Load up to 7 rules from CMS
  const rules: string[] = [];
  for (let i = 0; i < 7; i++) {
    const block = getBlock(`rule-${i}`);
    rules.push(block?.body_text ?? t(FALLBACK_RULES_KEYS[i]));
  }

  return (
    <PageLayout>
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="max-w-lg text-center"
        >
          <h1 className="text-4xl md:text-5xl font-light mb-10">{title}</h1>

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
              {t("regole.linkOffer")}
            </Link>
          </div>

          <div className="mt-6">
            <Link
              to="/rimozione"
              className="font-mono-light text-base text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              {t("regole.linkRemoval")}
            </Link>
          </div>
        </motion.div>
      </main>
    </PageLayout>
  );
};

export default Regole;
