import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OfferingSubmissionWizard from "@/components/OfferingSubmissionWizard";
import {
  type DepositSite,
  type Offering,
  type StoryCreatureData,
} from "@/components/cavapendo-gallery/types";
import { useActiveInitiative } from "@/hooks/useActiveInitiative";

export function OfferingModal({
  offering,
  onClose,
}: {
  offering: Offering | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const authorDisplay =
    offering?.author_type === "anonymous"
      ? t("gallery.offeringModal.authorAnonymous")
      : offering?.author_name || t("gallery.offeringModal.authorArtist");

  return (
    <AnimatePresence>
      {offering && (
        <motion.div
          key={offering.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 18 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative max-h-[82vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border/30 bg-background p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-2xl leading-none text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
            <h2 className="mb-4 text-2xl font-serif text-foreground">
              {offering.title || t("gallery.offeringModal.untitled")}
            </h2>
            {offering.text_content && (
              <p className="mb-4 font-serif text-lg italic leading-relaxed text-foreground/80">
                {offering.text_content}
              </p>
            )}
            {offering.note && (
              <p className="mb-4 text-sm italic text-muted-foreground">
                “{offering.note}”
              </p>
            )}
            {offering.media_type === "image" && offering.file_url && (
              <img
                src={offering.file_url}
                alt={offering.title || t("gallery.offeringModal.imageAlt")}
                className="mb-4 max-h-[360px] w-full rounded-md bg-muted object-contain"
              />
            )}
            {offering.media_type === "video" && offering.file_url && (
              <video
                src={offering.file_url}
                controls
                className="mb-4 max-h-[360px] w-full rounded-md bg-muted"
              />
            )}
            {offering.media_type === "audio" && offering.file_url && (
              <audio src={offering.file_url} controls className="mb-4 w-full" />
            )}
            {offering.media_type === "link" && offering.link_url && (
              <a
                href={offering.link_url}
                target="_blank"
                rel="noreferrer"
                className="mb-4 block text-sm text-foreground underline underline-offset-4"
              >
                {t("gallery.offeringModal.openLinkNewTab")}
              </a>
            )}
            {offering.media_type === "pdf" &&
              (offering.file_url || offering.link_url) && (
                <a
                  href={offering.file_url || offering.link_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-4 block text-sm text-foreground underline underline-offset-4"
                >
                  {t("gallery.offeringModal.openPdf")}
                </a>
              )}
            <div className="mt-6 border-t border-border/30 pt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <p>
                {t("gallery.offeringModal.authorPrefix")} <span className="text-foreground">{authorDisplay}</span>
              </p>
              <p className="mt-1">
                {t("gallery.offeringModal.sentPrefix")}{" "}
                {new Date(offering.created_at).toLocaleDateString("it-IT")}
              </p>
              {!offering.id.startsWith("demo-") && (
                <Link
                  to={`/o/${offering.id}`}
                  className="mt-3 inline-block border border-border/40 px-4 py-1.5 hover:border-foreground/30 hover:text-foreground"
                  onClick={onClose}
                >
                  {t("gallery.offeringModal.openDetail")}
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CreatureModal({
  creature,
  onClose,
}: {
  creature: StoryCreatureData | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {creature && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 18 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-sm rounded-xl border border-border/30 bg-background p-7 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-2xl leading-none text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
            <div
              className="mx-auto mb-3 h-4 w-4 rounded-full"
              style={{
                backgroundColor: creature.color,
                boxShadow: `0 0 12px ${creature.color}`,
              }}
            />
            <h3 className="mb-3 text-xl font-serif">{creature.name}</h3>
            <p className="font-serif italic leading-relaxed text-foreground/80">
              {creature.story}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RitualPrompt({
  site,
  count,
  onClose,
  onBeginOffering,
}: {
  site: DepositSite | null;
  count: number;
  onClose: () => void;
  onBeginOffering: () => void;
}) {
  const { t } = useTranslation();
  if (!site) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,7,7,0.62)] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 16 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative w-full max-w-md rounded-3xl border border-[#dcc4aa] bg-[linear-gradient(180deg,_rgba(247,239,229,0.98),_rgba(239,227,212,0.97))] p-6 text-[#24180f] shadow-[0_30px_80px_rgba(36,24,15,0.38)] backdrop-blur-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-2xl leading-none text-[#5b4a3b] hover:text-[#1f150f]"
          >
            ×
          </button>
          <p className="font-mono-light text-[0.65rem] uppercase tracking-[0.18em] text-[#786452]">
            {site.label}
          </p>
          <h3 className="mt-2 text-2xl font-light text-[#24180f]">
            Sosta rituale
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#49382c]">
            {site.subtitle}. Fermati un momento, ascolta il luogo, poi scegli
            se lasciare davvero una cavapendolata qui.
          </p>
          <div className="mt-4 rounded-2xl border border-[#cfb79d] bg-[#fff6eb] px-4 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-[#513f32] shadow-[inset_0_1px_0_rgba(255,255,255,0.56)]">
            Depositi raccolti qui: {count}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onBeginOffering}
              className="rounded-full bg-[#241912] px-5 py-3 text-sm uppercase tracking-[0.15em] text-[#fff7ec] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
            >
              Lascia qui qualcosa
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-[#bca48d] bg-[#f7ede1] px-5 py-3 text-sm uppercase tracking-[0.15em] text-[#4b392c]"
            >
              Continua a camminare
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function DepositModal({
  site,
  onClose,
  onSubmitted,
}: {
  site: DepositSite | null;
  onClose: () => void;
  onSubmitted: (siteId: string) => void;
}) {
  const { data: initiative } = useActiveInitiative();
  return (
    <AnimatePresence>
      {site && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
        <motion.div
          initial={{ scale: 0.94, y: 18 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 18 }}
          transition={{ type: "spring", damping: 22 }}
          className="relative w-full max-w-2xl rounded-[1.8rem] border border-[#d9c6b3] bg-[linear-gradient(180deg,_rgba(247,239,229,0.98),_rgba(240,229,214,0.98))] p-6 text-[#24180f] shadow-[0_34px_90px_rgba(18,12,9,0.42)] md:p-8"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-2xl leading-none text-[#675444] hover:text-[#24180f]"
          >
            ×
          </button>
          <div className="mb-6">
            <p className="font-mono-light text-[0.65rem] uppercase tracking-[0.16em] text-[#7c6552]">
              {site.label}
            </p>
            <h2 className="mt-2 text-2xl font-light text-[#24180f]">
              Lascia qui una cavapendolata
            </h2>
            <p className="mt-2 text-sm italic text-[#5b493c]">
              {site.subtitle}. La traccia resta in questo luogo: non esce mai
              dalla scena che stai attraversando.
            </p>
            {initiative && (
              <p className="mt-3 text-xs italic text-[#7c6552]">
                Un pensiero: {initiative.prompt}
              </p>
            )}
            </div>

            <OfferingSubmissionWizard
              title="Lascia una traccia"
              subtitle="Una forma, un suono, un testo: qualcosa che questo luogo possa trattenere."
              submitLabel="Lascia qui"
              onCancel={onClose}
              onSubmitted={() => {
                onSubmitted(site.id);
                onClose();
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
