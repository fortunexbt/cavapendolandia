import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdmin } from "@/hooks/useAdmin";
import { useThemeMode } from "@/hooks/useThemeMode";
import { AdminShell } from "@/components/admin/AdminShell";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import { useMeadowElements } from "@/features/meadow/hooks/useMeadowElements";
import { pratoEditor } from "@/lib/featureFlags";

type ElementType = "tree" | "monolith" | "lantern" | "billboard";

const PratoEditorStub = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-border bg-card/70 p-8 text-center">
        <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          {t("admin.comingSoon")}
        </p>
        <h2 className="mt-3 text-2xl font-light tracking-[0.08em]">{t("admin.prato")}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("admin.pratoEditorComingSoon")}
        </p>
      </div>
    </div>
  );
};

const PratoEditorContent = () => {
  const { t } = useTranslation();
  const { user, isAdmin, loading } = useAdmin();
  const { mode, setThemeMode } = useThemeMode();
  const { elements, isLoading, createElement, updateElement, deleteElement, isCreating } =
    useMeadowElements();

  const [form, setForm] = useState({
    element_type: "tree" as ElementType,
    label: "",
    position_x: 0,
    position_z: 0,
    scale: 1,
    rotation: 0,
    tone: "#4a7c59",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!form.label.trim()) return;
    createElement(form);
    setForm({ element_type: "tree", label: "", position_x: 0, position_z: 0, scale: 1, rotation: 0, tone: "#4a7c59" });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateElement({ id: editingId, patch: form });
    setEditingId(null);
    setForm({ element_type: "tree", label: "", position_x: 0, position_z: 0, scale: 1, rotation: 0, tone: "#4a7c59" });
  };

  const startEdit = (el: typeof elements[0]) => {
    setEditingId(el.id);
    setForm({
      element_type: el.element_type,
      label: el.label,
      position_x: el.position_x,
      position_z: el.position_z,
      scale: el.scale,
      rotation: el.rotation,
      tone: el.tone,
    });
  };

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

  return (
    <AdminShell rightContent={<AdminThemeToggle mode={mode} onChange={setThemeMode} />}>
      <div className="mb-6 rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur">
        <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          {t("admin.meadowElements")}
        </p>
        <h1 className="mt-2 text-3xl leading-tight md:text-4xl">{t("admin.pratoEditor")}</h1>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card/70 p-5 shadow-sm">
        <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground mb-4">
          {editingId ? t("admin.editElement") : t("admin.addElement")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={form.element_type}
            onChange={(e) => setForm({ ...form, element_type: e.target.value as ElementType })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="tree">{t("admin.tree")}</option>
            <option value="monolith">{t("admin.monolith")}</option>
            <option value="lantern">{t("admin.lantern")}</option>
            <option value="billboard">{t("admin.billboard")}</option>
          </select>
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder={t("admin.label")}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="number"
            value={form.position_x}
            onChange={(e) => setForm({ ...form, position_x: parseFloat(e.target.value) || 0 })}
            placeholder={t("admin.positionX")}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="number"
            value={form.position_z}
            onChange={(e) => setForm({ ...form, position_z: parseFloat(e.target.value) || 0 })}
            placeholder={t("admin.positionZ")}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="number"
            step="0.1"
            value={form.scale}
            onChange={(e) => setForm({ ...form, scale: parseFloat(e.target.value) || 1 })}
            placeholder={t("admin.scale")}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="number"
            value={form.rotation}
            onChange={(e) => setForm({ ...form, rotation: parseFloat(e.target.value) || 0 })}
            placeholder={t("admin.rotation")}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="color"
            value={form.tone}
            onChange={(e) => setForm({ ...form, tone: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 h-11"
          />
          {editingId ? (
            <button
              onClick={handleUpdate}
              className="rounded-xl border border-foreground/30 bg-foreground px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] font-mono-light text-primary-foreground"
            >
              {t("admin.update")}
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isCreating || !form.label.trim()}
              className="rounded-xl border border-foreground/30 bg-foreground px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] font-mono-light text-primary-foreground disabled:opacity-40"
            >
              {t("admin.add")}
            </button>
          )}
        </div>
        {editingId && (
          <button
            onClick={() => { setEditingId(null); setForm({ element_type: "tree", label: "", position_x: 0, position_z: 0, scale: 1, rotation: 0, tone: "#4a7c59" }); }}
            className="mt-3 rounded-full border border-border px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] font-mono-light text-muted-foreground hover:text-foreground"
          >
            {t("admin.cancelEdit")}
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground/70 italic">{t("admin.loadingElements")}</p>
      ) : elements.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/70 p-12 text-center">
          <p className="text-sm text-muted-foreground/70 italic">{t("admin.noElements")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {elements.map((el) => (
            <article
              key={el.id}
              className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: el.tone }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{el.label}</p>
                    <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground">
                      {el.element_type} · x: {el.position_x} · z: {el.position_z} · {t("admin.scale")}: {el.scale} · {t("admin.rot")}: {el.rotation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(el)}
                    className="rounded-full border border-border px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] font-mono-light text-muted-foreground hover:text-foreground"
                  >
                    {t("admin.edit")}
                  </button>
                  <button
                    onClick={() => deleteElement(el.id)}
                    className="rounded-full border border-destructive/40 px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] font-mono-light text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    {t("admin.delete")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
};

const PratoEditor = () => {
  const { user, loading } = useAdmin();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return null;
  if (!pratoEditor) return <PratoEditorStub />;
  return <PratoEditorContent />;
};

export default PratoEditor;
