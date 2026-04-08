import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/shared/PageLayout";
import { usePageBlocks } from "@/features/content/hooks/usePageBlocks";

const FALLBACK_PARAGRAPHS_KEYS = [
  "cheCose.p1",
  "cheCose.p2",
  "cheCose.p3",
  "cheCose.p4",
];

const CheCose = () => {
  const { t } = useTranslation();
  const { getBlock } = usePageBlocks("che-cose");

  const titleBlock = getBlock("title");
  const p1Block = getBlock("p1");
  const p2Block = getBlock("p2");
  const p3Block = getBlock("p3");
  const p4Block = getBlock("p4");

  const title = titleBlock?.body_text ?? t("cheCose.title");
  const paragraphs = [
    p1Block?.body_text ?? t(FALLBACK_PARAGRAPHS_KEYS[0]),
    p2Block?.body_text ?? t(FALLBACK_PARAGRAPHS_KEYS[1]),
    p3Block?.body_text ?? t(FALLBACK_PARAGRAPHS_KEYS[2]),
    p4Block?.body_text ?? t(FALLBACK_PARAGRAPHS_KEYS[3]),
  ];

  return (
    <PageLayout>
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg text-center space-y-10"
        >
          <h1 className="text-4xl font-light md:text-5xl">{title}</h1>

          <div className="space-y-6">
            {paragraphs.map((text, i) => (
              <p
                key={i}
                className={`leading-relaxed text-foreground/90 ${
                  i === 2 ? "text-2xl italic" : "text-xl"
                }`}
              >
                {text}
              </p>
            ))}
          </div>

          <div className="pt-8">
            <Link
              to="/regole"
              className="inline-block border-2 border-foreground/20 bg-background/80 px-10 py-4 text-lg uppercase tracking-[0.25em] font-mono-light hover:bg-foreground hover:text-primary-foreground transition-all duration-300"
            >
              {t("cheCose.linkRules")}
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 pt-4">
            <Link
              to="/rimozione"
              className="font-mono-light text-base text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              {t("cheCose.linkRemoval")}
            </Link>
          </div>
        </motion.div>
      </main>
    </PageLayout>
  );
};

export default CheCose;
