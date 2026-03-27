import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import OfferingSubmissionWizard from "@/components/OfferingSubmissionWizard";
import {
  type DepositSite,
  type Offering,
  type StoryCreatureData,
} from "@/components/cavapendo-gallery/types";

export function OfferingModal({
  offering,
  onClose,
}: {
  offering: Offering | null;
  onClose: () => void;
}) {
  const authorDisplay =
    offering?.author_type === "anonymous"
      ? "Anonimo"
      : offering?.author_name || "Artista";

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
              {offering.title || "Senza titolo"}
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
                alt={offering.title || "Immagine"}
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
                Apri il link in una nuova scheda
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
                  Apri il PDF
                </a>
              )}
            <div className="mt-6 border-t border-border/30 pt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <p>
                Di <span className="text-foreground">{authorDisplay}</span>
              </p>
              <p className="mt-1">
                Inviata:{" "}
                {new Date(offering.created_at).toLocaleDateString("it-IT")}
              </p>
              {!offering.id.startsWith("demo-") && (
                <Link
                  to={`/o/${offering.id}`}
                  className="mt-3 inline-block border border-border/40 px-4 py-1.5 hover:border-foreground/30 hover:text-foreground"
                  onClick={onClose}
                >
                  Apri dettaglio →
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
  if (!site) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 16 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative w-full max-w-md rounded-3xl border border-[#d9c4ac] bg-[#f6ebdd]/96 p-6 shadow-[0_30px_80px_rgba(36,24,15,0.32)] backdrop-blur-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-2xl leading-none text-[#6d5b49] hover:text-[#2c2016]"
          >
            ×
          </button>
          <p className="font-mono-light text-[0.65rem] uppercase tracking-[0.18em] text-[#786452]">
            {site.label}
          </p>
          <h3 className="mt-2 text-2xl font-light text-[#24180f]">
            Rito di soglia
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#5a4838]">
            {site.subtitle}. Prima ascolta il luogo, poi scegli se lasciare
            davvero una cavapendolata dentro questo santuario.
          </p>
          <div className="mt-4 rounded-2xl border border-[#dbc6b1] bg-[#f0e2d1] px-4 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-[#6a5644]">
            Depositi raccolti qui: {count}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onBeginOffering}
              className="rounded-full bg-[#2b2016] px-5 py-3 text-sm uppercase tracking-[0.15em] text-[#f6efe4]"
            >
              Lascia una cavapendolata
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-[#c9b49d] px-5 py-3 text-sm uppercase tracking-[0.15em] text-[#5d4a39]"
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
            className="relative w-full max-w-2xl rounded-2xl border border-border/35 bg-background p-6 shadow-2xl md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-2xl leading-none text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
            <div className="mb-6">
              <p className="font-mono-light text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground/70">
                {site.label}
              </p>
              <h2 className="mt-2 text-2xl font-light">
                Lascia qui una cavapendolata
              </h2>
              <p className="mt-2 text-sm italic text-muted-foreground">
                {site.subtitle}. Il deposito resta nel globo: nessun salto fuori
                dal mondo.
              </p>
            </div>

            <OfferingSubmissionWizard
              title="Deposito nel prato"
              subtitle="Una forma, un suono, un testo: qualcosa che il vento possa tenere."
              submitLabel="Lascia nel prato"
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
