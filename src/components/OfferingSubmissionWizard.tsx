import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MAX_AUTHOR_LENGTH,
  MAX_FILE_BYTES,
  MAX_NOTE_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/lib/offeringValidation";
import {
  ACCEPT_MAP,
  MEDIA_LABELS,
  STEP_LABELS,
  type AuthorType,
  canProceedSubmissionStep,
  createInitialSubmissionDraft,
  type MediaType,
  submitOfferingSubmission,
} from "@/lib/offeringSubmission";

interface OfferingSubmissionWizardProps {
  title: string;
  subtitle: string;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmitted?: () => void;
  renderSuccess?: (context: { resetForm: () => void }) => ReactNode;
}

const OfferingSubmissionWizard = ({
  title,
  subtitle,
  submitLabel = "Invia all'Anticamera",
  onCancel,
  onSubmitted,
  renderSuccess,
}: OfferingSubmissionWizardProps) => {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(createInitialSubmissionDraft);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canProceed = canProceedSubmissionStep(step, draft);

  const resetForm = () => {
    setSubmitted(false);
    setSubmitting(false);
    setStep(1);
    setDraft(createInitialSubmissionDraft());
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = await submitOfferingSubmission(draft);
    setSubmitting(false);

    if (!result.ok) {
      if (result.reason !== "honeypot") {
        toast.error(result.message);
      }
      return;
    }

    setSubmitted(true);
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <>
        {renderSuccess ? (
          renderSuccess({ resetForm })
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-light mb-4">Accolta</h2>
            <p className="text-muted-foreground italic">
              La tua cavapendolata è in attesa di entrare.
            </p>
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-5xl font-light mb-3">{title}</h1>
          <p className="text-lg md:text-xl italic text-muted-foreground">
            {subtitle}
          </p>
        </motion.div>
      </div>

      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((dotStep) => (
            <div
              key={dotStep}
              className={`h-3 w-3 rounded-full transition-colors ${
                dotStep === step
                  ? "bg-foreground"
                  : dotStep < step
                    ? "bg-foreground/30"
                    : "bg-border"
              }`}
            />
          ))}
        </div>
        <p className="font-mono-light text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground/60">
          {step} — {STEP_LABELS[step]}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-[12rem]"
        >
          {step === 1 && (
            <div className="space-y-4">
              <p className="font-mono-light text-muted-foreground text-center mb-6 uppercase tracking-[0.13em] text-lg">
                Cosa lasci?
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.keys(MEDIA_LABELS) as MediaType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setDraft((current) => ({ ...current, mediaType: type }));
                      setStep(2);
                    }}
                    className={`py-5 border text-lg font-mono-light transition-all duration-300 ${
                      draft.mediaType === type
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    {MEDIA_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && draft.mediaType && (
            <div className="space-y-4">
              {draft.mediaType === "text" ? (
                <Textarea
                  value={draft.textContent}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      textContent: e.target.value,
                    }))
                  }
                  placeholder="Scrivi qui..."
                  className="min-h-[160px] bg-transparent border-border/50 focus:border-foreground/30 font-serif text-lg resize-none p-4"
                  maxLength={MAX_TEXT_LENGTH}
                />
              ) : draft.mediaType === "link" ? (
                <Input
                  type="url"
                  value={draft.linkUrl}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      linkUrl: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="bg-transparent border-border/50 focus:border-foreground/30 font-mono-light text-lg p-4"
                  maxLength={2048}
                />
              ) : (
                <>
                  <label className="block border-2 border-dashed border-border/50 hover:border-foreground/30 transition-colors p-10 text-center cursor-pointer rounded-lg">
                    <input
                      type="file"
                      accept={ACCEPT_MAP[draft.mediaType] || "*/*"}
                      onChange={(e) =>
                        setDraft((current) => ({
                          ...current,
                          file: e.target.files?.[0] || null,
                        }))
                      }
                      className="hidden"
                    />
                    {draft.file ? (
                      <span className="font-mono-light text-lg text-foreground/70">
                        {draft.file.name}
                      </span>
                    ) : (
                      <span className="font-mono-light text-lg text-muted-foreground/50">
                        Scegli un file
                      </span>
                    )}
                  </label>
                  <p className="font-mono-light text-muted-foreground/40 text-center">
                    Max {(MAX_FILE_BYTES / (1024 * 1024)).toFixed(0)} MB.
                  </p>
                </>
              )}

              <div className="pt-3 space-y-1">
                <p className="font-mono-light text-muted-foreground/55 text-center text-xs">
                  Piccolo va bene.
                </p>
                <p className="font-mono-light text-muted-foreground/45 text-center text-xs">
                  Non deve spiegare tutto.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Input
                value={draft.title}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    title: e.target.value,
                  }))
                }
                placeholder="Titolo (opzionale)"
                className="bg-transparent border-border/50 focus:border-foreground/30 font-serif"
                maxLength={MAX_TITLE_LENGTH}
              />
              <Textarea
                value={draft.note}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    note: e.target.value,
                  }))
                }
                placeholder="Due righe, se vuoi."
                className="min-h-[80px] bg-transparent border-border/50 focus:border-foreground/30 font-serif resize-none"
                maxLength={MAX_NOTE_LENGTH}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <p className="font-mono-light text-muted-foreground text-center mb-4 uppercase tracking-[0.13em] text-xs">
                Come vuoi apparire?
              </p>
              <RadioGroup
                value={draft.authorType}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    authorType: value as AuthorType,
                  }))
                }
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="anonymous" id="anonymous" />
                  <Label
                    htmlFor="anonymous"
                    className="font-mono-light text-sm cursor-pointer"
                  >
                    Anonimo
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="name" id="name" />
                  <Label
                    htmlFor="name"
                    className="font-mono-light text-sm cursor-pointer"
                  >
                    Nome o pseudonimo
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="instagram" id="instagram" />
                  <Label
                    htmlFor="instagram"
                    className="font-mono-light text-sm cursor-pointer"
                  >
                    @Instagram (opzionale)
                  </Label>
                </div>
              </RadioGroup>

              {draft.authorType !== "anonymous" && (
                <Input
                  value={draft.authorName}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      authorName: e.target.value,
                    }))
                  }
                  placeholder={
                    draft.authorType === "instagram"
                      ? "@tuonome"
                      : "come vuoi essere chiamato/a"
                  }
                  className="bg-transparent border-border/50 focus:border-foreground/30 font-mono-light"
                  maxLength={MAX_AUTHOR_LENGTH + 1}
                />
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="rights"
                  checked={draft.consentRights}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      consentRights: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="rights"
                  className="font-mono-light text-xs leading-relaxed cursor-pointer"
                >
                  Questo contenuto e mio, oppure posso condividerlo.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="archive"
                  checked={draft.consentArchive}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      consentArchive: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="archive"
                  className="font-mono-light text-xs leading-relaxed cursor-pointer"
                >
                  Va bene se entra in Archivio, dopo l'Anticamera.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="reshare"
                  checked={draft.consentReshare}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      consentReshare: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="reshare"
                  className="font-mono-light text-xs leading-relaxed cursor-pointer text-muted-foreground"
                >
                  Se necessario, puo essere ricondivisa nei canali del progetto.
                </Label>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            onClick={() => setStep((current) => current - 1)}
            className="font-mono-light text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← torna
          </button>
        ) : onCancel ? (
          <button
            onClick={onCancel}
            className="font-mono-light text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            chiudi
          </button>
        ) : (
          <div />
        )}

        {step >= 2 && step <= 4 && (
          <button
            onClick={() => canProceed && setStep((current) => current + 1)}
            disabled={!canProceed}
            className="font-mono-light text-sm uppercase tracking-[0.15em] px-8 py-3 border border-foreground/30 hover:bg-foreground hover:text-primary-foreground transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            avanti
          </button>
        )}

        {step === 5 && (
          <button
            onClick={handleSubmit}
            disabled={!canProceed || submitting}
            className="font-mono-light text-sm uppercase tracking-[0.15em] px-8 py-3 border border-foreground/30 hover:bg-foreground hover:text-primary-foreground transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "..." : submitLabel}
          </button>
        )}
      </div>

      <div className="sr-only" aria-hidden>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          value={draft.honeypot}
          onChange={(e) =>
            setDraft((current) => ({
              ...current,
              honeypot: e.target.value,
            }))
          }
        />
      </div>
    </div>
  );
};

export default OfferingSubmissionWizard;
