import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdmin } from "@/hooks/useAdmin";
import { useThemeMode } from "@/hooks/useThemeMode";
import { AdminShell } from "@/components/admin/AdminShell";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import IniziativePanel from "@/components/admin/IniziativePanel";
import { useInitiatives } from "@/features/initiatives/hooks/useInitiatives";

const Iniziative = () => {
  const { t } = useTranslation();
  const { user, isAdmin, loading } = useAdmin();
  const { mode, setThemeMode } = useThemeMode();
  const { initiatives, isLoading, createInitiative, toggleInitiative, deleteInitiative, isCreating } =
    useInitiatives();

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
          {t("admin.curatorialSeeds")}
        </p>
        <h1 className="mt-2 text-3xl leading-tight md:text-4xl">{t("admin.initiativesTitle")}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {t("admin.initiativesHint")}
        </p>
      </div>

      <IniziativePanel
        initiatives={initiatives}
        loading={isLoading}
        busy={isCreating}
        onCreate={(payload) => createInitiative({ ...payload, created_by: user.id })}
        onToggle={(id, isActive) => toggleInitiative({ id, isActive })}
        onDelete={(id) => deleteInitiative(id)}
      />
    </AdminShell>
  );
};

export default Iniziative;
