import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MAX_AUTHOR_LENGTH,
  MAX_FILE_BYTES,
  MAX_NOTE_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  canSubmitFromClientRateLimit,
  getOrCreateSubmissionFingerprint,
  isValidHttpUrl,
  isValidInstagramHandle,
  normalizeInstagramHandle,
  registerClientSubmission,
} from "@/lib/offeringValidation";
import { createOfferingDraft } from "@/data/offeringsRepository";
import type { OffriOverlayState } from "@/world/types";

type MediaType = "image" | "video" | "audio" | "text" | "pdf" | "link";
type AuthorType = "anonymous" | "name" | "instagram";

type OffriOverlayProps = {
  open: boolean;
  state: OffriOverlayState;
  onStateChange: (next: OffriOverlayState) => void;
  onClose: () => void;
  onSubmitted: () => void;
};

const ACCEPT_MAP: Record<string, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
  pdf: "application/pdf",
};

const STEP_LABELS: Record<number, string> = {
  1: "Scelta",
  2: "Deposito",
  3: "Nome",
  4: "Firma",
  5: "Consenso",
};

const MEDIA_LABELS: Record<MediaType, string> = {
  image: "Immagine",
  video: "Video",
  audio: "Audio",
  text: "Testo",
  pdf: "PDF",
  link: "Link",
};

export const OffriOverlay = ({ open, state, onStateChange, onClose, onSubmitted }: OffriOverlayProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [authorType, setAuthorType] = useState<AuthorType>("anonymous");
  const [authorName, setAuthorName] = useState("");
  const [consentRights, setConsentRights] = useState(false);
  const [consentArchive, setConsentArchive] = useState(false);
  const [consentReshare, setConsentReshare] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const mediaType = state.mediaType;

  const normalizedAuthorName = useMemo(() => {
    if (authorType !== "instagram") return authorName.trim();
    return normalizeInstagramHandle(authorName);
  }, [authorName, authorType]);

  const step = state.step;

  const setStep = (next: 1 | 2 | 3 | 4 | 5) => {
    onStateChange({ ...state, step: next });
  };

  const setMediaType = (next: MediaType | null) => {
    onStateChange({ ...state, mediaType: next });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!mediaType;
      case 2:
        if (!mediaType) return false;
        if (mediaType === "text") {
          return textContent.trim().length > 0 && textContent.trim().length <= MAX_TEXT_LENGTH;
        }
        if (mediaType === "link") {
          return linkUrl.trim().length > 0 && linkUrl.length <= 2048 && isValidHttpUrl(linkUrl);
        }
        return !!file && file.size <= MAX_FILE_BYTES;
      case 3:
        return title.trim().length <= MAX_TITLE_LENGTH && note.trim().length <= MAX_NOTE_LENGTH;
      case 4:
        if (authorType === "anonymous") return true;
        if (!normalizedAuthorName || normalizedAuthorName.length === 0) return false;
        if (normalizedAuthorName.length > MAX_AUTHOR_LENGTH) return false;
        return authorType === "instagram" ? isValidInstagramHandle(authorName) : true;
      case 5:
        return consentRights && consentArchive;
      default:
        return false;
    }
  };

  const resetForm = () => {
    onStateChange({
      isOpen: open,
      step: 1,
      mediaType: null,
      submitting: false,
      submitted: false,
    });
    setFile(null);
    setTextContent("");
    setLinkUrl("");
    setTitle("");
    setNote("");
    setAuthorType("anonymous");
    setAuthorName("");
    setConsentRights(false);
    setConsentArchive(false);
    setConsentReshare(false);
    setHoneypot("");
  };

  const handleSubmit = async () => {
    if (!mediaType || state.submitting) return;
    if (honeypot.trim().length > 0) return;
    if (mediaType === "link" && !isValidHttpUrl(linkUrl)) {
      toast.error("Inserisci un link completo.");
      return;
    }
    if (mediaType === "text" && textContent.trim().length > MAX_TEXT_LENGTH) {
      toast.error("Il testo supera la lunghezza massima consentita.");
      return;
    }
    if (authorType === "instagram" && !isValidInstagramHandle(authorName)) {
      toast.error("Firma Instagram non valida.");
      return;
    }
    if (!canSubmitFromClientRateLimit()) {
      toast.error("Hai inviato molte offerte. Riprova tra qualche minuto.");
      return;
    }

    onStateChange({ ...state, submitting: true });
    try {
      await createOfferingDraft({
        mediaType,
        file,
        textContent,
        linkUrl,
        title,
        note,
        authorType,
        authorName: authorType === "anonymous" ? null : normalizedAuthorName,
        consentRights,
        consentArchive,
        consentReshare,
        submissionFingerprint: getOrCreateSubmissionFingerprint(),
      });
      registerClientSubmission();
      onStateChange({ ...state, submitting: false, submitted: true });
      onSubmitted();
      toast.success("Offerta inviata in Anticamera");
    } catch (error) {
      console.error(error);
      onStateChange({ ...state, submitting: false });
      toast.error("Qualcosa e andato storto. Riprova.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 mx-auto w-[min(95vw,48rem)] max-h-[min(88vh,46rem)] overflow-y-auto rounded-t-3xl border border-white/25 bg-[#05080dcc]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-18px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-8"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.18em] text-[#bdd3ea]">
                Deposito nel luogo
              </p>
              <h2 className="mt-2 text-[1.95rem] italic text-[#fbf2df] md:text-3xl">Lascia un'offerta</h2>
              <p className="mt-1 font-mono-light text-[0.66rem] uppercase tracking-[0.15em] text-[#9fb5c8]">
                Step {step}/5 - {STEP_LABELS[step]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="min-h-10 rounded-full border border-white/25 px-3 py-1.5 font-mono-light text-xs uppercase tracking-[0.14em] text-[#d7e7f3] hover:bg-white/10"
            >
              Chiudi
            </button>
          </div>

          {state.submitted ? (
            <div className="mt-6 rounded-2xl border border-[#f0c56f]/45 bg-black/35 p-5 text-[#f3e6cb]">
              <p className="text-lg italic">Accolta. Ora e in attesa di entrare.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={resetForm}
                  className="rounded-full border border-white/30 px-4 py-2 font-mono-light text-xs uppercase tracking-[0.14em]"
                >
                  Nuova offerta
                </button>
                <button
                  onClick={onClose}
                  className="rounded-full border border-[#55bfca] px-4 py-2 font-mono-light text-xs uppercase tracking-[0.14em] text-[#d7f7fb]"
                >
                  Torna al mondo
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-4">
                {step === 1 && (
                  <RadioGroup
                    value={mediaType ?? ""}
                    onValueChange={(value) => setMediaType((value as MediaType) || null)}
                    className="grid grid-cols-2 gap-2 md:grid-cols-3"
                  >
                    {Object.entries(MEDIA_LABELS).map(([value, label]) => (
                      <label
                        key={value}
                        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/18 bg-black/25 p-3 hover:border-white/35"
                      >
                        <RadioGroupItem value={value} id={`media-${value}`} />
                        <span className="font-mono-light text-xs uppercase tracking-[0.13em] text-[#dfebf6]">
                          {label}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                )}

                {step === 2 && mediaType && (
                  <div className="space-y-3">
                    {mediaType === "text" && (
                      <Textarea
                        value={textContent}
                        onChange={(event) => setTextContent(event.target.value)}
                        className="min-h-[10rem] border-white/18 bg-black/30 text-[#f5efe1]"
                        placeholder="Scrivi il tuo frammento..."
                      />
                    )}
                    {mediaType === "link" && (
                      <Input
                        value={linkUrl}
                        onChange={(event) => setLinkUrl(event.target.value)}
                        className="border-white/18 bg-black/30 text-[#f5efe1]"
                        placeholder="https://..."
                      />
                    )}
                    {mediaType !== "text" && mediaType !== "link" && (
                      <Input
                        type="file"
                        accept={ACCEPT_MAP[mediaType]}
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        className="border-white/18 bg-black/30 text-[#f5efe1]"
                      />
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-3">
                    <div>
                      <Label className="mb-1 block font-mono-light text-xs uppercase tracking-[0.13em] text-[#bcd0e3]">
                        Titolo (opzionale)
                      </Label>
                      <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="border-white/18 bg-black/30 text-[#f5efe1]"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block font-mono-light text-xs uppercase tracking-[0.13em] text-[#bcd0e3]">
                        Nota (opzionale)
                      </Label>
                      <Textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        className="min-h-[8rem] border-white/18 bg-black/30 text-[#f5efe1]"
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid gap-3">
                    <RadioGroup
                      value={authorType}
                      onValueChange={(value) => setAuthorType(value as AuthorType)}
                      className="grid gap-2"
                    >
                      {[
                        ["anonymous", "Anonimo"],
                        ["name", "Nome"],
                        ["instagram", "Instagram"],
                      ].map(([value, label]) => (
                        <label
                          key={value}
                          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/18 bg-black/25 p-3 hover:border-white/35"
                        >
                          <RadioGroupItem value={value} id={`author-${value}`} />
                          <span className="font-mono-light text-xs uppercase tracking-[0.13em] text-[#dfebf6]">
                            {label}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                    {authorType !== "anonymous" && (
                      <Input
                        value={authorName}
                        onChange={(event) => setAuthorName(event.target.value)}
                        className="border-white/18 bg-black/30 text-[#f5efe1]"
                        placeholder={authorType === "instagram" ? "@nome" : "Nome"}
                      />
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div className="grid gap-3">
                    <label className="flex items-start gap-2 rounded-xl border border-white/18 bg-black/22 p-3">
                      <Checkbox checked={consentRights} onCheckedChange={(checked) => setConsentRights(!!checked)} />
                      <span className="text-sm text-[#dce8f4]">Confermo di avere i diritti per condividere questo contenuto.</span>
                    </label>
                    <label className="flex items-start gap-2 rounded-xl border border-white/18 bg-black/22 p-3">
                      <Checkbox checked={consentArchive} onCheckedChange={(checked) => setConsentArchive(!!checked)} />
                      <span className="text-sm text-[#dce8f4]">Accetto l'archiviazione nell'Anticamera Cavapendoli.</span>
                    </label>
                    <label className="flex items-start gap-2 rounded-xl border border-white/18 bg-black/22 p-3">
                      <Checkbox checked={consentReshare} onCheckedChange={(checked) => setConsentReshare(!!checked)} />
                      <span className="text-sm text-[#dce8f4]">Consento eventuale ricondivisione curatoriale.</span>
                    </label>
                    <Input
                      value={honeypot}
                      onChange={(event) => setHoneypot(event.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      placeholder="Non compilare"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep((Math.max(1, step - 1) as 1 | 2 | 3 | 4 | 5))}
                  disabled={step === 1 || state.submitting}
                  className="min-h-11 rounded-full border border-white/24 px-4 py-2 font-mono-light text-xs uppercase tracking-[0.14em] text-[#d4e3f0] disabled:opacity-40"
                >
                  Indietro
                </button>
                {step < 5 ? (
                  <button
                    onClick={() => setStep((Math.min(5, step + 1) as 1 | 2 | 3 | 4 | 5))}
                    disabled={!canProceed() || state.submitting}
                    className="min-h-11 rounded-full border border-[#f0c56f] px-5 py-2 font-mono-light text-xs uppercase tracking-[0.14em] text-[#ffefce] disabled:opacity-40"
                  >
                    Avanti
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || state.submitting}
                    className="min-h-11 rounded-full border border-[#53c0ca] px-5 py-2 font-mono-light text-xs uppercase tracking-[0.14em] text-[#d4fbff] disabled:opacity-40"
                  >
                    {state.submitting ? "Invio..." : "Invia"}
                  </button>
                )}
              </div>
            </>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
};
