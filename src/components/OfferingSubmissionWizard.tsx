import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
  type AuthorType,
  canProceedSubmissionStep,
  createInitialSubmissionDraft,
  type MediaType,
  submitOfferingSubmission,
} from "@/lib/offeringSubmission";

const MEDIA_TYPE_KEYS: Record<MediaType, string> = {
  image: "wizard.mediaTypeImage",
  video: "wizard.mediaTypeVideo",
  audio: "wizard.mediaTypeAudio",
  text: "wizard.mediaTypeText",
  pdf: "wizard.mediaTypePdf",
  link: "wizard.mediaTypeLink",
};

const STEP_KEYS: Record<number, string> = {
  1: "wizard.stepChoice",
  2: "wizard.stepDeposit",
  3: "wizard.stepName",
  4: "wizard.stepSignature",
  5: "wizard.stepConsent",
};

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
  submitLabel,
  onCancel,
  onSubmitted,
  renderSuccess,
}: OfferingSubmissionWizardProps) => {
  const { t } = useTranslation();
  const defaultSubmitLabel = t("wizard.submitLabel");
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

  const getErrorMessage = (result: { ok: false; reason?: string; message?: string }): string => {
    if (result.message) return result.message;
    if (result.reason === "honeypot") return "";
    const map: Record<string, string> = {
      missing_media_type: t("wizard.errorMissingMediaType"),
      invalid_link: t("wizard.errorInvalidLink"),
      text_too_long: t("wizard.errorTextTooLong"),
      invalid_instagram: t("wizard.errorInvalidInstagram"),
      rate_limited: t("wizard.errorRateLimited"),
      file_too_large: t("wizard.errorFileTooLarge"),
      upload_failed: t("wizard.errorUploadFailed"),
      insert_failed: t("wizard.errorInsertFailed"),
    };
    return (result.reason && map[result.reason]) ? map[result.reason] : t("wizard.submittingError");
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = await submitOfferingSubmission(draft);
    setSubmitting(false);

    if (!result.ok) {
      if (!("reason" in result && result.reason === "honeypot")) {
        toast.error(getErrorMessage(result));
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
            <h2 className="text-2xl font-light mb-4">{t("wizard.successTitle")}</h2>
            <p className="text-muted-foreground italic">
              {t("wizard.successMessage")}
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
          {step} — {t(STEP_KEYS[step])}
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
                {t("wizard.step1Prompt")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.keys(MEDIA_TYPE_KEYS) as MediaType[]).map((type) => (
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
                    {t(MEDIA_TYPE_KEYS[type])}
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
                  placeholder={t("wizard.step2TextPlaceholder")}
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
                  placeholder={t("wizard.step2LinkPlaceholder")}
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
                        {t("wizard.step2FilePlaceholder")}
                      </span>
                    )}
                  </label>
                  <p className="font-mono-light text-muted-foreground/40 text-center">
                    {t("wizard.step2FileSize", { size: (MAX_FILE_BYTES / (1024 * 1024)).toFixed(0) })}
                  </p>
                </>
              )}

              <div className="pt-3 space-y-1">
                <p className="font-mono-light text-muted-foreground/55 text-center text-xs">
                  {t("wizard.step2HintSmall")}
                </p>
                <p className="font-mono-light text-muted-foreground/45 text-center text-xs">
                  {t("wizard.step2HintNoExplain")}
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
                placeholder={t("wizard.step3TitlePlaceholder")}
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
                placeholder={t("wizard.step3NotePlaceholder")}
                className="min-h-[80px] bg-transparent border-border/50 focus:border-foreground/30 font-serif resize-none"
                maxLength={MAX_NOTE_LENGTH}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <p className="font-mono-light text-muted-foreground text-center mb-4 uppercase tracking-[0.13em] text-xs">
                {t("wizard.step4Prompt")}
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
                    {t("wizard.step4AuthorAnonymous")}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="name" id="name" />
                  <Label
                    htmlFor="name"
                    className="font-mono-light text-sm cursor-pointer"
                  >
                    {t("wizard.step4AuthorName")}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="instagram" id="instagram" />
                  <Label
                    htmlFor="instagram"
                    className="font-mono-light text-sm cursor-pointer"
                  >
                    {t("wizard.step4AuthorInstagram")}
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
                      ? t("wizard.step4InstagramPlaceholder")
                      : t("wizard.step4NamePlaceholder")
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
                  {t("wizard.consentRights")}
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
                  {t("wizard.consentArchive")}
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
                  {t("wizard.consentReshare")}
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
            {t("wizard.back")}
          </button>
        ) : onCancel ? (
          <button
            onClick={onCancel}
            className="font-mono-light text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("wizard.close")}
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
            {t("wizard.next")}
          </button>
        )}

        {step === 5 && (
          <button
            onClick={handleSubmit}
            disabled={!canProceed || submitting}
            className="font-mono-light text-sm uppercase tracking-[0.15em] px-8 py-3 border border-foreground/30 hover:bg-foreground hover:text-primary-foreground transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "..." : (submitLabel || defaultSubmitLabel)}
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
