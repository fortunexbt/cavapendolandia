import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { withSignedFileUrls } from "@/lib/offeringMedia";
import { Input } from "@/components/ui/input";

type StatusFilter = "pending" | "approved" | "rejected" | "hidden";
type MediaFilter = "all" | "image" | "video" | "audio" | "text" | "pdf" | "link";

const STATUS_TABS: { value: StatusFilter; label: string; path: string }[] = [
  { value: "pending", label: "Anticamera", path: "/admin/anticamera" },
  { value: "approved", label: "Archivio", path: "/admin/archivio" },
  { value: "hidden", label: "Nascosti", path: "/admin/nascosti" },
  { value: "rejected", label: "Rifiutati", path: "/admin/rifiutati" },
];

const Anticamera = ({ statusFilter = "pending" }: { statusFilter?: StatusFilter }) => {
  const { user, isAdmin, loading, signOut } = useAdmin();
  const queryClient = useQueryClient();
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: offerings = [], isLoading } = useQuery({
    queryKey: ["admin-offerings", statusFilter, mediaFilter],
    queryFn: async () => {
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
      return withSignedFileUrls(data || []);
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
      const { error } = await supabase
        .from("offerings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offerings"] });
      queryClient.invalidateQueries({ queryKey: ["offerings-approved"] });
      toast.success("Aggiornato");
    },
    onError: () => toast.error("Errore"),
  });

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/admin" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-mono-light text-muted-foreground">Accesso non autorizzato.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-mono-light text-xs text-muted-foreground hover:text-foreground">
            ← Sito
          </Link>
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              to={tab.path}
              className={`font-mono-light text-xs uppercase tracking-[0.1em] transition-colors ${
                statusFilter === tab.value
                  ? "text-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <button
          onClick={signOut}
          className="font-mono-light text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          Esci
        </button>
      </header>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border/30 flex flex-wrap items-center gap-4">
        {["all", "image", "video", "audio", "text", "pdf", "link"].map((f) => (
          <button
            key={f}
            onClick={() => setMediaFilter(f as MediaFilter)}
            className={`font-mono-light text-xs transition-colors ${
              mediaFilter === f
                ? "text-foreground"
                : "text-muted-foreground/40 hover:text-muted-foreground"
            }`}
          >
            {f === "all" ? "Tutti" : f}
          </button>
        ))}
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Cerca titolo, nota o firma"
          className="max-w-xs bg-transparent border-border/40 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono-light text-xs"
        />
      </div>

      {/* List */}
      <div className="px-6 py-6">
        {isLoading ? (
          <p className="font-mono-light text-muted-foreground/40 animate-pulse">...</p>
        ) : filteredOfferings.length === 0 ? (
          <p className="font-mono-light text-muted-foreground/40">Nessuna offerta.</p>
        ) : (
          <div className="space-y-3">
            {filteredOfferings.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between border border-border/30 px-4 py-3 hover:border-border/60 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Preview */}
                  {o.media_type === "image" && o.file_url && (
                    <img
                      src={o.file_url}
                      alt=""
                      className="w-10 h-10 object-cover rounded-sm flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/o/${o.id}`}
                      className="font-mono-light text-sm hover:text-foreground transition-colors truncate block"
                    >
                      {o.title || "Offerta"}{" "}
                      <span className="text-muted-foreground/40">
                        ({o.media_type})
                      </span>
                    </Link>
                    <p className="font-mono-light text-xs text-muted-foreground/40">
                      {o.author_type === "anonymous"
                        ? "Anonimo"
                        : o.author_name || "—"}{" "}
                      · {format(new Date(o.created_at), "d MMM yyyy", { locale: it })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusFilter === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus.mutate({ id: o.id, status: "approved" })
                        }
                        disabled={updateStatus.isPending}
                        className="font-mono-light text-xs px-3 py-1 border border-foreground/20 hover:bg-foreground hover:text-primary-foreground transition-all"
                      >
                        Approva
                      </button>
                      <button
                        onClick={() =>
                          updateStatus.mutate({ id: o.id, status: "rejected" })
                        }
                        disabled={updateStatus.isPending}
                        className="font-mono-light text-xs px-3 py-1 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                      >
                        Rifiuta
                      </button>
                    </>
                  )}
                  {statusFilter === "approved" && (
                    <button
                      onClick={() =>
                        updateStatus.mutate({ id: o.id, status: "hidden" })
                      }
                      disabled={updateStatus.isPending}
                      className="font-mono-light text-xs px-3 py-1 border border-border/30 text-muted-foreground hover:border-foreground/30 transition-all"
                    >
                      Oscura
                    </button>
                  )}
                  {statusFilter === "hidden" && (
                    <button
                      onClick={() =>
                        updateStatus.mutate({ id: o.id, status: "approved" })
                      }
                      disabled={updateStatus.isPending}
                      className="font-mono-light text-xs px-3 py-1 border border-foreground/20 hover:bg-foreground hover:text-primary-foreground transition-all"
                    >
                      Ripristina
                    </button>
                  )}
                  <Link
                    to={`/admin/o/${o.id}`}
                    className="font-mono-light text-xs px-3 py-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    Dettagli
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Anticamera;
