import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAdmin } from "@/hooks/useAdmin";
import { withSignedFileUrls } from "@/lib/offeringMedia";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import AnticameraOfferingRow from "@/components/admin/AnticameraOfferingRow";
import IniziativePanel from "@/components/admin/IniziativePanel";
import { useThemeMode } from "@/hooks/useThemeMode";
import { AdminShell } from "@/components/admin/AdminShell";

type StatusFilter = "pending" | "approved" | "rejected" | "hidden";
type MediaFilter = "all" | "image" | "video" | "audio" | "text" | "pdf" | "link";

type Initiative = {
  id: string;
  prompt: string;
  details: string | null;
  is_active: boolean;
  created_at: string;
};

type AdminOffering = Pick<
  Tables<"offerings">,
  "id" | "title" | "note" | "author_name" | "author_type" | "media_type" | "file_url" | "status" | "created_at"
> & {
  file_path?: string | null;
};

const STATUS_TABS: { value: StatusFilter; labelKey: string; path: string }[] = [
  { value: "pending", labelKey: "admin.anticamera", path: "/admin/anticamera" },
  { value: "approved", labelKey: "admin.archivio", path: "/admin/archivio" },
  { value: "hidden", labelKey: "admin.nascosti", path: "/admin/nascosti" },
  { value: "rejected", labelKey: "admin.rifiutati", path: "/admin/rifiutati" },
];

const MEDIA_FILTERS: MediaFilter[] = ["all", "image", "video", "audio", "text", "pdf", "link"];

const Anticamera = ({ statusFilter = "pending" }: { statusFilter?: StatusFilter }) => {
  const { t } = useTranslation();
  const { user, isAdmin, loading, signOut, isDemo } = useAdmin();
  const { mode, setThemeMode } = useThemeMode();
  const queryClient = useQueryClient();
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");


  const DEMO_OFFERINGS: AdminOffering[] = [
    {
      id: "demo-1",
      title: t("admin.demoOffer1Title"),
      note: t("admin.demoOffer1Note"),
      author_name: t("admin.demoOffer1Author"),
      author_type: "name",
      media_type: "image",
      file_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
      status: "pending" as const,
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-2",
      title: t("admin.demoOffer2Title"),
      note: t("admin.demoOffer2Note"),
      author_name: t("admin.demoOffer2Author"),
      author_type: "name",
      media_type: "text",
      file_url: null,
      status: "pending" as const,
      created_at: new Date().toISOString(),
    },
  ];

  const DEMO_INITIATIVES: Initiative[] = [
    {
      id: "demo-init-1",
      prompt: t("admin.demoInitiativePrompt"),
      details: t("admin.demoInitiativeDetails"),
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const { data: offerings = [], isLoading } = useQuery<AdminOffering[]>({
    queryKey: ["admin-offerings", statusFilter, mediaFilter],
    queryFn: async () => {
      if (isDemo) return withSignedFileUrls(DEMO_OFFERINGS.filter((o) => o.status === statusFilter));
      let query = supabase
        .from("offerings")
        .select("*")
        .eq("status", statusFilter)
        .order("created_at", { ascending: false });

      if (mediaFilter !== "all") {
        query = query.eq("media_type", mediaFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return withSignedFileUrls((data || []) as AdminOffering[]);
    },
    enabled: isAdmin,
  });

  // Fetch counts for all status tabs
  const { data: statusCounts } = useQuery({
    queryKey: ["admin-status-counts"],
    queryFn: async () => {
      const counts: Record<StatusFilter, number> = { pending: 0, approved: 0, rejected: 0, hidden: 0 };
      const results = await Promise.all(
        (["pending", "approved", "rejected", "hidden"] as StatusFilter[]).map(async (s) => {
          const { count, error } = await supabase
            .from("offerings")
            .select("*", { count: "exact", head: true })
            .eq("status", s);
          return { status: s, count: error ? 0 : (count ?? 0) };
        })
      );
      results.forEach((r) => { counts[r.status] = r.count; });
      return counts;
    },
    enabled: isAdmin,
    staleTime: 30_000,
  });

  const { data: initiatives = [], isLoading: initiativesLoading } = useQuery({
    queryKey: ["admin-initiatives"],
    queryFn: async () => {
      if (isDemo) return DEMO_INITIATIVES;
      const { data, error } = await supabase      .from("initiatives")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []) as Initiative[];
    },
    enabled: isAdmin,
  });

  const filteredOfferings = useMemo(() => {
    if (!searchTerm.trim()) return offerings;
    const term = searchTerm.trim().toLowerCase();

    return offerings.filter((offering) =>
      [offering.title, offering.note, offering.author_name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [offerings, searchTerm]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusFilter }) => {
      const timestamp = new Date().toISOString();
      const patch: Record<string, string | null> = { status };

      if (status === "approved") {
        patch.approved_at = timestamp;
        patch.rejected_at = null;
        patch.hidden_at = null;
      }
      if (status === "rejected") {
        patch.rejected_at = timestamp;
      }
      if (status === "hidden") {
        patch.hidden_at = timestamp;
      }

      const { error } = await supabase.from("offerings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offerings"] });
      queryClient.invalidateQueries({ queryKey: ["offerings-approved"] });
      toast.success(t("admin.moderationUpdated"));
    },
    onError: () => toast.error(t("admin.moderationError")),
  });

  const createInitiative = useMutation({
    mutationFn: async ({ prompt, details }: { prompt: string; details: string }) => {
      const { error } = await supabase.from("initiatives").insert({
        prompt,
        details: details || null,
        is_active: true,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-initiatives"] });
      queryClient.invalidateQueries({ queryKey: ["active-initiative"] });
      toast.success(t("admin.initiativePublished"));
    },
    onError: () => toast.error(t("admin.initiativePublishError")),
  });

  const toggleInitiative = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("initiatives")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-initiatives"] });
      queryClient.invalidateQueries({ queryKey: ["active-initiative"] });
    },
  });

  const deleteInitiative = useMutation({
    mutationFn: async (initiativeId: string) => {
      const { error } = await supabase.from("initiatives").delete().eq("id", initiativeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-initiatives"] });
      queryClient.invalidateQueries({ queryKey: ["active-initiative"] });
      toast.success(t("admin.initiativeDeleted"));
    },
  });

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
      <div className="mb-4 flex flex-wrap items-center gap-4 md:gap-6">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            to={tab.path}
            className={`font-mono-light text-[0.67rem] uppercase tracking-[0.12em] flex items-center gap-1.5 ${
              statusFilter === tab.value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(tab.labelKey)}
            {statusCounts && statusCounts[tab.value] > 0 && (
              <Badge variant={tab.value === "pending" ? "default" : "secondary"} className="text-[0.55rem] px-1.5 py-0 h-4 min-w-[1.2rem] justify-center">
                {statusCounts[tab.value]}
              </Badge>
            )}
          </Link>
        ))}
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur">
          <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            {t("admin.moderationLive")}
          </p>
          <h1 className="mt-2 text-3xl leading-tight md:text-4xl">{t("admin.anticameraCuratoriale")}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            {t("admin.moderationHint")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {MEDIA_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setMediaFilter(f)}
                className={`rounded-full border px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] font-mono-light ${
                  mediaFilter === f
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? t("admin.tutti") : f}
              </button>
            ))}
          </div>
        </div>

        <IniziativePanel
          initiatives={initiatives}
          loading={initiativesLoading}
          busy={createInitiative.isPending}
          onCreate={(payload) => createInitiative.mutate(payload)}
          onToggle={(id, isActive) => toggleInitiative.mutate({ id, isActive })}
          onDelete={(id) => deleteInitiative.mutate(id)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("admin.searchPlaceholder")}
            className="max-w-sm border-input bg-background"
          />
          <p className="font-mono-light text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            {filteredOfferings.length} {t("admin.results")}
          </p>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground/70 italic">{t("admin.loadingOfferings")}</p>
        ) : filteredOfferings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground/70 italic">{t("admin.noOfferings")}</p>
        ) : (
          <div className="space-y-3">
            {filteredOfferings.map((offering) => (
              <AnticameraOfferingRow
                key={offering.id}
                offering={offering}
                statusFilter={statusFilter}
                loading={updateStatus.isPending}
                onModerate={(offeringId, status) =>
                  updateStatus.mutate({ id: offeringId, status })
                }
              />
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
};

export default Anticamera;