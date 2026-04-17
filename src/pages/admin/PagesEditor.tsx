import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdmin } from "@/hooks/useAdmin";
import { useThemeMode } from "@/hooks/useThemeMode";
import { AdminShell } from "@/components/admin/AdminShell";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import { usePageContent } from "@/features/content/hooks/usePageContent";
import { pagesCms } from "@/lib/featureFlags";

type PageDef = { slug: string; label: string; blocks: string[] };

const PAGES: PageDef[] = [
  { slug: "index", label: "Home", blocks: ["subtitle", "description"] },
  { slug: "che-cose", label: "Che cos'è", blocks: ["title", "p1", "p2", "p3", "p4"] },
  { slug: "regole", label: "Regole", blocks: ["title", "rule-0", "rule-1", "rule-2", "rule-3", "rule-4", "rule-5", "rule-6"] },
  { slug: "rimozione", label: "Rimozione", blocks: ["title", "line1", "line2"] },
];

const LOCALES = [
  { code: "it", label: "Italiano" },
  { code: "en", label: "English" },
];

const BlockPreview = ({ title, body }: { title?: string | null; body?: string | null }) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4">
      <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground mb-2">
        {t("admin.preview")}
      </p>
      {title && <h2 className="text-xl font-medium text-foreground">{title}</h2>}
      {body && <p className="mt-2 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{body}</p>}
      {!title && !body && <p className="text-sm italic text-muted-foreground/60">{t("admin.noContent")}</p>}
    </div>
  );
};

const PagesEditorStub = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-border bg-card/70 p-8 text-center">
        <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          {t("admin.incoming")}
        </p>
        <h2 className="mt-3 text-2xl font-light tracking-[0.08em]">{t("admin.navPagine")}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("admin.pagesComingSoon")}
        </p>
      </div>
    </div>
  );
};

const PagesEditorContent = () => {
  const { t } = useTranslation();
  const { user, isAdmin, loading } = useAdmin();
  const { mode, setThemeMode } = useThemeMode();
  const [slug, setSlug] = useState<string>(PAGES[0].slug);
  const currentPage = useMemo(() => PAGES.find((p) => p.slug === slug) ?? PAGES[0], [slug]);
  const [blockKey, setBlockKey] = useState<string>(currentPage.blocks[0]);
  const [locale, setLocale] = useState<string>("it");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setBlockKey(currentPage.blocks[0]);
  }, [currentPage]);

  const { block, isLoading, save, isSaving } = usePageContent(
    slug,
    blockKey,
    {
      saveSuccess: t("admin.pageContentSaved"),
      saveError: t("admin.pageContentSaveError"),
    },
    locale,
  );

  useEffect(() => {
    setTitle(block?.title ?? "");
    setBody(block?.body_text ?? "");
  }, [block, slug, blockKey, locale]);

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/admin" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card/70 p-8 text-center">
          <p className="text-base text-foreground">{t("admin.unauthorized")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("admin.noPermissions")}
          </p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    save({ title, body_text: body });
  };

  return (
    <AdminShell rightContent={<AdminThemeToggle mode={mode} onChange={setThemeMode} />}>
      <div className="mb-6 rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur">
        <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          {t("admin.cmsContent")}
        </p>
        <h1 className="mt-2 text-3xl leading-tight md:text-4xl">{t("admin.pagesEditor")}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-card/70 p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono-light text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">
                {t("admin.page")}
              </label>
              <select
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {PAGES.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.label} ({p.slug})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono-light text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">
                {t("admin.block")}
              </label>
              <select
                value={blockKey}
                onChange={(e) => setBlockKey(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {currentPage.blocks.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono-light text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">
                Locale
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono-light text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">
              {t("admin.title")}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder={t("admin.titlePlaceholder")}
            />
          </div>

          <div>
            <label className="block font-mono-light text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">
              {t("admin.body")}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
              placeholder={t("admin.bodyPlaceholder")}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-xl border border-foreground/30 bg-foreground px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.12em] font-mono-light text-primary-foreground disabled:opacity-40"
          >
            {isSaving ? t("admin.saving") : t("admin.saveBlock")}
          </button>
        </div>

        <div className="space-y-4">
          <BlockPreview title={title} body={body} />
          {isLoading && <p className="text-sm italic text-muted-foreground/70">{t("admin.loading")}</p>}
        </div>
      </div>
    </AdminShell>
  );
};

const PagesEditor = () => {
  const { user, loading } = useAdmin();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return null;
  if (!pagesCms) return <PagesEditorStub />;
  return <PagesEditorContent />;
};

export default PagesEditor;
