import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Textarea } from "@/components/ui/textarea";
import OfferingCard from "@/components/OfferingCard";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { withSignedFileUrl } from "@/lib/offeringMedia";

type OfferingStatus = "pending" | "approved" | "rejected" | "hidden";

const AdminOfferingDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdmin();
  const queryClient = useQueryClient();
  const [curatorialNote, setCuratorialNote] = useState("");

  const { data: offering, isLoading } = useQuery({
    queryKey: ["admin-offering", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      setCuratorialNote(data.curatorial_note || "");
      return withSignedFileUrl(data);
    },
    enabled: !!id && isAdmin,
  });

  const updateStatus = useMutation({
    mutationFn: async (status: OfferingStatus) => {
      const { error } = await supabase.from("offerings").update({ status }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offerings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-offering", id] });
      queryClient.invalidateQueries({ queryKey: ["offerings-approved"] });
      toast.success(t("admin.statusUpdated"));
    },
  });

  const saveCuratorialNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("offerings")
        .update({ curatorial_note: curatorialNote.trim() || null })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offering", id] });
      toast.success(t("admin.noteSaved"));
    },
  });

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/admin" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-mono-light text-muted-foreground">{t("admin.unauthorized")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4 flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="font-mono-light text-xs text-muted-foreground hover:text-foreground"
        >
          {t("admin.back")}
        </button>
        <span className="font-mono-light text-xs text-muted-foreground/40">
          {t("admin.offeringDetail")}
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {isLoading || !offering ? (
          <p className="font-mono-light text-muted-foreground/40 animate-pulse">...</p>
        ) : (
          <div className="space-y-8">
            <OfferingCard
              id={offering.id}
              mediaType={offering.media_type}
              fileUrl={offering.file_url}
              textContent={offering.text_content}
              linkUrl={offering.link_url}
              title={offering.title}
              note={offering.note}
              authorType={offering.author_type}
              authorName={offering.author_name}
              createdAt={offering.created_at}
              curatorialNote={offering.curatorial_note}
              full
            />

            <div className="border-t border-border/30 pt-6 space-y-2 font-mono-light text-xs text-muted-foreground/60">
              <p>{t("admin.status")} <span className="text-foreground/70">{offering.status}</span></p>
              <p>{t("admin.type")} <span className="text-foreground/70">{offering.media_type}</span></p>
              <p>{t("admin.author")} <span className="text-foreground/70">
                {offering.author_type === "anonymous"
                  ? t("admin.anonymous")
                  : offering.author_type === "instagram"
                    ? `@${(offering.author_name || "").replace(/^@+/, "")}`
                    : offering.author_name || "—"}
              </span></p>
              <p>{t("admin.rights")} {offering.consent_rights ? "✓" : "✗"} · {t("admin.archive")} {offering.consent_archive ? "✓" : "✗"} · {t("admin.reshare")} {offering.consent_reshare ? "✓" : "✗"}</p>
              <p>{t("admin.created")} {format(new Date(offering.created_at), "d MMMM yyyy, HH:mm", { locale: it })}</p>
              {offering.approved_at && (
                <p>{t("admin.approved")} {format(new Date(offering.approved_at), "d MMMM yyyy, HH:mm", { locale: it })}</p>
              )}
            </div>

            <div className="border-t border-border/30 pt-6">
              <p className="font-mono-light text-xs text-muted-foreground/60 mb-2">
                {t("admin.curatorialNote")}
              </p>
              <Textarea
                value={curatorialNote}
                onChange={(e) => setCuratorialNote(e.target.value)}
                placeholder={t("admin.curatorialNotePlaceholder")}
                className="min-h-[60px] bg-transparent border-border/50 font-mono-light text-sm resize-none"
                maxLength={140}
              />
              <button
                onClick={() => saveCuratorialNote.mutate()}
                className="mt-2 font-mono-light text-xs px-4 py-1 border border-border/30 hover:border-foreground/30 transition-colors"
              >
                {t("admin.saveNote")}
              </button>
            </div>

            <div className="border-t border-border/30 pt-6 flex items-center gap-3">
              {offering.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus.mutate("approved")}
                    disabled={updateStatus.isPending}
                    className="font-mono-light text-xs px-4 py-2 border border-foreground/20 hover:bg-foreground hover:text-primary-foreground transition-all"
                  >
                    {t("admin.approve")}
                  </button>
                  <button
                    onClick={() => updateStatus.mutate("rejected")}
                    disabled={updateStatus.isPending}
                    className="font-mono-light text-xs px-4 py-2 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                  >
                    {t("admin.reject")}
                  </button>
                </>
              )}
              {offering.status === "approved" && (
                <button
                  onClick={() => updateStatus.mutate("hidden")}
                  disabled={updateStatus.isPending}
                  className="font-mono-light text-xs px-4 py-2 border border-border/30 hover:border-foreground/30 transition-colors"
                >
                  {t("admin.hide")}
                </button>
              )}
              {(offering.status === "rejected" || offering.status === "hidden") && (
                <button
                  onClick={() => updateStatus.mutate("approved")}
                  disabled={updateStatus.isPending}
                  className="font-mono-light text-xs px-4 py-2 border border-foreground/20 hover:bg-foreground hover:text-primary-foreground transition-all"
                >
                  {t("admin.approve")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOfferingDetail;
