import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdmin } from "@/hooks/useAdmin";
import { useThemeMode } from "@/hooks/useThemeMode";
import { AdminShell } from "@/components/admin/AdminShell";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import { useVisitorMessages } from "@/features/messages/hooks/useVisitorMessages";
import { visitorMessages } from "@/lib/featureFlags";
import { Badge } from "@/components/ui/badge";

const MessagesStub = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-border bg-card/70 p-8 text-center">
        <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          {t("admin.incoming")}
        </p>
        <h2 className="mt-3 text-2xl font-light tracking-[0.08em]">{t("admin.messagesTitle")}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("admin.messagesComingSoon")}
        </p>
      </div>
    </div>
  );
};

const MessagesContent = () => {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, loading } = useAdmin();
  const { mode, setThemeMode } = useThemeMode();
  const { messages, unreadCount, isLoading, markAsRead, markAllAsRead, deleteMessage, isMarkingAll } =
    useVisitorMessages();

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur">
          <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            {t("admin.inbox")}
          </p>
          <h1 className="mt-2 text-3xl leading-tight md:text-4xl">{t("admin.messagesTitle")}</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
            className="rounded-full border border-border px-4 py-2 font-mono-light text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            {t("admin.markAllAsRead", { count: unreadCount })}
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground/70 italic">{t("admin.loadingMessages")}</p>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/70 p-12 text-center">
          <p className="text-sm text-muted-foreground/70 italic">{t("admin.noMessages")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <article
              key={msg.id}
              className={`rounded-2xl border p-5 shadow-sm transition-all ${
                msg.is_read
                  ? "border-border bg-card/50"
                  : "border-border bg-card/90 border-foreground/20"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {msg.visitor_name || t("admin.anonymous")}
                    </p>
                    {msg.visitor_email && (
                      <span className="text-xs text-muted-foreground">{msg.visitor_email}</span>
                    )}
                    {!msg.is_read && (
                      <Badge variant="default" className="text-[0.55rem] px-1.5 py-0 h-4">
                        {t("admin.new")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{msg.body}</p>
                  <p className="mt-2 font-mono-light text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground">
                    {new Date(msg.created_at).toLocaleString(i18n.language)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!msg.is_read && (
                    <button
                      onClick={() => markAsRead(msg.id)}
                      className="rounded-full border border-border px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] font-mono-light text-muted-foreground hover:text-foreground"
                    >
                      {t("admin.read")}
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg.id)}
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

const Messages = () => {
  if (!visitorMessages) return <MessagesStub />;
  return <MessagesContent />;
};

export default Messages;
