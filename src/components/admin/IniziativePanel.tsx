import { useState } from "react";
import { useTranslation } from "react-i18next";

type Initiative = {
  id: string;
  prompt: string;
  details: string | null;
  is_active: boolean;
  created_at: string;
};

type IniziativePanelProps = {
  initiatives: Initiative[];
  loading: boolean;
  busy: boolean;
  onCreate: (payload: { prompt: string; details: string }) => void;
  onToggle: (initiativeId: string, isActive: boolean) => void;
  onDelete: (initiativeId: string) => void;
};

const IniziativePanel = ({
  initiatives,
  loading,
  busy,
  onCreate,
  onToggle,
  onDelete,
}: IniziativePanelProps) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [details, setDetails] = useState("");

  const handleCreate = () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    onCreate({ prompt: trimmedPrompt, details: details.trim() });
    setPrompt("");
    setDetails("");
  };

  return (
    <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-4">
        <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          {t("admin.initiatives")}
        </p>
        <h2 className="text-2xl leading-tight mt-2">{t("admin.initiativesTitle")}</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={t("admin.initiativePromptPlaceholder")}
          maxLength={180}
          className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={busy || !prompt.trim()}
          className="h-11 rounded-xl border border-foreground/30 bg-foreground px-4 text-[0.7rem] uppercase tracking-[0.12em] font-mono-light text-primary-foreground disabled:opacity-40"
        >
          {t("admin.publishInitiative")}
        </button>
      </div>

      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder={t("admin.initiativeDetailsPlaceholder")}
        maxLength={320}
        className="mt-3 min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground/70 italic">{t("admin.loadingInitiatives")}</p>
        ) : initiatives.length === 0 ? (
          <p className="text-sm text-muted-foreground/70 italic">{t("admin.noInitiatives")}</p>
        ) : (
          initiatives.map((initiative) => (
            <div
              key={initiative.id}
              className="rounded-xl border border-border bg-background/70 px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm leading-relaxed text-foreground">{initiative.prompt}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(initiative.id, !initiative.is_active)}
                    className="rounded-full border border-border px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] font-mono-light text-muted-foreground hover:text-foreground"
                  >
                    {initiative.is_active ? t("admin.activate") : t("admin.deactivate")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(initiative.id)}
                    className="rounded-full border border-destructive/40 px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] font-mono-light text-destructive"
                  >
                    {t("admin.delete")}
                  </button>
                </div>
              </div>
              {initiative.details && (
                <p className="mt-2 text-xs text-muted-foreground">{initiative.details}</p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default IniziativePanel;
