import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import { toast } from "sonner";
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

type MediaType = "image" | "video" | "audio" | "text" | "pdf" | "link";
type AuthorType = "anonymous" | "name" | "instagram";

const MEDIA_LABELS: Record<MediaType, string> = {
  image: "Immagine",
  video: "Video",
  audio: "Audio",
  text: "Testo",
  pdf: "PDF",
  link: "Link",
};

const ACCEPT_MAP: Record<string, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
  pdf: "application/pdf",
};

const Offri = () => {
  const [step, setStep] = useState(1);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const normalizedAuthorName = useMemo(() => {
    if (authorType !== "instagram") return authorName.trim();
    return normalizeInstagramHandle(authorName);
  }, [authorName, authorType]);

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setMediaType(null);
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

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!mediaType;
      case 2:
        if (!mediaType) return false;
        if (mediaType === "text")
          return (
            textContent.trim().length > 0 &&
            textContent.trim().length <= MAX_TEXT_LENGTH
          );
        if (mediaType === "link")
          return (
            linkUrl.trim().length > 0 &&
            linkUrl.length <= 2048 &&
            isValidHttpUrl(linkUrl)
          );
        return !!file && file.size <= MAX_FILE_BYTES;
      case 3:
        return (
          title.trim().length <= MAX_TITLE_LENGTH &&
          note.trim().length <= MAX_NOTE_LENGTH
        );
      case 4:
        if (authorType === "anonymous") return true;
        if (!normalizedAuthorName || normalizedAuthorName.length === 0)
          return false;
        if (normalizedAuthorName.length > MAX_AUTHOR_LENGTH) return false;
        return authorType === "instagram"
          ? isValidInstagramHandle(authorName)
          : true;
      case 5:
        return consentRights && consentArchive;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!mediaType || submitting) return;
    if (honeypot.trim()) return;
    if (mediaType === "link" && !isValidHttpUrl(linkUrl)) {
      toast.error("Il link deve iniziare con http:// o https://");
      return;
    }
    if (mediaType === "text" && textContent.trim().length > MAX_TEXT_LENGTH) {
      toast.error("Il testo supera la lunghezza massima consentita.");
      return;
    }
    if (authorType === "instagram" && !isValidInstagramHandle(authorName)) {
      toast.error("Handle Instagram non valido.");
      return;
    }

    if (!canSubmitFromClientRateLimit()) {
      toast.error("Hai inviato molte offerte. Riprova tra qualche minuto.");
      return;
    }
    setSubmitting(true);

    try {
      let filePath: string | null = null;
      let fileSize: number | null = null;

      // Upload file if needed
      if (file && mediaType !== "text" && mediaType !== "link") {
        if (file.size > MAX_FILE_BYTES) {
          toast.error("Il file supera il limite di 100 MB.");
          setSubmitting(false);
          return;
        }

        const ext = file.name.split(".").pop();
        const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("offerings")
          .upload(path, file);
        if (uploadError) throw uploadError;
        filePath = path;
        fileSize = file.size;
      }

      const { error } = await supabase.from("offerings").insert({
        media_type: mediaType,
        file_path: filePath,
        file_size: fileSize,
        text_content: mediaType === "text" ? textContent.trim() : null,
        link_url: mediaType === "link" ? linkUrl.trim() : null,
        title: title.trim() || null,
        note: note.trim() || null,
        author_type: authorType,
        author_name:
          authorType === "anonymous" ? null : normalizedAuthorName || null,
        consent_rights: consentRights,
        consent_archive: consentArchive,
        consent_reshare: consentReshare,
        status: "pending",
        submission_fingerprint: getOrCreateSubmissionFingerprint(),
      });

      if (error) throw error;
      registerClientSubmission();
      setSubmitted(true);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Qualcosa è andato storto. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MinimalHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-light mb-6">Accolta</h1>
            <p className="text-lg italic text-muted-foreground mb-2">
              La tua offerta è stata accolta.
            </p>
            <p className="text-lg italic text-muted-foreground mb-12">
              Ora è in attesa di entrare.
            </p>
            <div className="flex items-center justify-center gap-8">
              <Link
                to="/entra"
                className="font-mono-light text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Entra
              </Link>
              <button
                onClick={resetForm}
                className="font-mono-light text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Lascia un'altra offerta
              </button>
            </div>
          </motion.div>
        </main>
        <MinimalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MinimalHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-light mb-3">
              Lascia un'offerta
            </h1>
            <p className="text-sm italic text-muted-foreground">
              Qualcosa che possa stare qui.
            </p>
          </motion.div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                  s <= step ? "bg-foreground/40" : "bg-border"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Step 1: Media type */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="font-mono-light text-muted-foreground text-center mb-6">
                    Cosa lasci?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(MEDIA_LABELS) as MediaType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setMediaType(type)}
                        className={`py-3 border text-sm font-mono-light transition-all duration-300 ${
                          mediaType === type
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

              {/* Step 2: Content */}
              {step === 2 && mediaType && (
                <div className="space-y-4">
                  {mediaType === "text" ? (
                    <>
                      <Textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Scrivi qui..."
                        className="min-h-[160px] bg-transparent border-border/50 focus:border-foreground/30 font-serif text-base resize-none"
                        maxLength={MAX_TEXT_LENGTH}
                      />
                      <p className="font-mono-light text-muted-foreground/40 text-center">
                        Piccolo va bene.
                      </p>
                    </>
                  ) : mediaType === "link" ? (
                    <>
                      <Input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="bg-transparent border-border/50 focus:border-foreground/30 font-mono-light"
                        maxLength={2048}
                      />
                      <p className="font-mono-light text-muted-foreground/40 text-center">
                        Inserisci solo link http/https.
                      </p>
                    </>
                  ) : (
                    <>
                      <label className="block border border-dashed border-border/50 hover:border-foreground/30 transition-colors p-8 text-center cursor-pointer">
                        <input
                          type="file"
                          accept={ACCEPT_MAP[mediaType] || "*/*"}
                          onChange={(e) =>
                            setFile(e.target.files?.[0] || null)
                          }
                          className="hidden"
                        />
                        {file ? (
                          <span className="font-mono-light text-foreground/70">
                            {file.name}
                          </span>
                        ) : (
                          <span className="font-mono-light text-muted-foreground/50">
                            Scegli un file
                          </span>
                        )}
                      </label>
                      <p className="font-mono-light text-muted-foreground/40 text-center">
                        Max 100 MB.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Title & Note */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Titolo (opzionale)"
                      className="bg-transparent border-border/50 focus:border-foreground/30 font-serif"
                      maxLength={MAX_TITLE_LENGTH}
                    />
                  </div>
                  <div>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Due righe, se vuoi."
                      className="min-h-[80px] bg-transparent border-border/50 focus:border-foreground/30 font-serif resize-none"
                      maxLength={MAX_NOTE_LENGTH}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Author */}
              {step === 4 && (
                <div className="space-y-6">
                  <p className="font-mono-light text-muted-foreground text-center mb-4">
                    Come vuoi apparire?
                  </p>
                  <RadioGroup
                    value={authorType}
                    onValueChange={(v) => setAuthorType(v as AuthorType)}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="anonymous" id="anonymous" />
                      <Label htmlFor="anonymous" className="font-mono-light text-sm cursor-pointer">
                        Anonimo
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="name" id="name" />
                      <Label htmlFor="name" className="font-mono-light text-sm cursor-pointer">
                        Nome o pseudonimo
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="instagram" id="instagram" />
                      <Label htmlFor="instagram" className="font-mono-light text-sm cursor-pointer">
                        @Instagram (opzionale)
                      </Label>
                    </div>
                  </RadioGroup>

                  {authorType !== "anonymous" && (
                    <Input
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={
                        authorType === "instagram"
                          ? "@tuonome"
                          : "come vuoi essere chiamato/a"
                      }
                      className="bg-transparent border-border/50 focus:border-foreground/30 font-mono-light"
                      maxLength={MAX_AUTHOR_LENGTH + 1}
                    />
                  )}
                </div>
              )}

              {/* Step 5: Consent */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="rights"
                      checked={consentRights}
                      onCheckedChange={(c) => setConsentRights(!!c)}
                    />
                    <Label htmlFor="rights" className="font-mono-light text-xs leading-relaxed cursor-pointer">
                      Ho i diritti per condividere questo contenuto.
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="archive"
                      checked={consentArchive}
                      onCheckedChange={(c) => setConsentArchive(!!c)}
                    />
                    <Label htmlFor="archive" className="font-mono-light text-xs leading-relaxed cursor-pointer">
                      Accetto che l'offerta sia mostrata in Archivio (dopo
                      approvazione).
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="reshare"
                      checked={consentReshare}
                      onCheckedChange={(c) => setConsentReshare(!!c)}
                    />
                    <Label htmlFor="reshare" className="font-mono-light text-xs leading-relaxed cursor-pointer text-muted-foreground">
                      Consento la ricondivisione sui canali del progetto.
                    </Label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="font-mono-light text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← indietro
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={() => canProceed() && setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="font-mono-light text-xs uppercase tracking-[0.15em] px-6 py-2 border border-foreground/20 hover:bg-foreground hover:text-primary-foreground transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                avanti
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="font-mono-light text-xs uppercase tracking-[0.15em] px-6 py-2 border border-foreground/20 hover:bg-foreground hover:text-primary-foreground transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? "..." : "Invia all'Anticamera"}
              </button>
            )}
          </div>

          <div className="sr-only" aria-hidden>
            <label htmlFor="website">Website</label>
            <input
              id="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Offri;
