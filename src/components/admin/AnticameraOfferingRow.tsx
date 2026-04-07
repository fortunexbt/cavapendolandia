import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { it } from "date-fns/locale";

type StatusFilter = "pending" | "approved" | "rejected" | "hidden";

type AnticameraOfferingRowProps = {
  offering: {
    id: string;
    title: string | null;
    note: string | null;
    media_type: string;
    author_type: string;
    author_name: string | null;
    created_at: string;
    file_url: string | null;
  };
  statusFilter: StatusFilter;
  loading: boolean;
  onModerate: (offeringId: string, status: StatusFilter) => void;
};

const AnticameraOfferingRow = ({
  offering,
  statusFilter,
  loading,
  onModerate,
}: AnticameraOfferingRowProps) => {
  const { t } = useTranslation();

  return (
    <article className="group rounded-2xl border border-border bg-card/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/35">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {offering.media_type === "image" && offering.file_url && (
            <img
              src={offering.file_url}
              alt={offering.title || t("admin.offeringPreviewAlt")}
              className="h-14 w-14 rounded-lg object-cover border border-border"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            <Link
              to={`/admin/o/${offering.id}`}
              className="block truncate text-base text-foreground transition-colors group-hover:text-foreground/80"
            >
              {offering.title || t("admin.untitled")}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground font-mono-light uppercase tracking-[0.1em]">
              {offering.author_type === "anonymous"
                ? t("admin.anonymous")
                : offering.author_name || "—"}{" "}
              · {offering.media_type} ·{" "}
              {format(new Date(offering.created_at), "d MMM yyyy", {
                locale: it,
              })}
            </p>
            {offering.note && (
              <p className="mt-2 line-clamp-1 text-sm italic text-muted-foreground/80">
                {offering.note}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap md:justify-end">
          {statusFilter === "pending" && (
            <>
              <button
                onClick={() => onModerate(offering.id, "approved")}
                disabled={loading}
                className="rounded-full border border-foreground/30 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.12em] font-mono-light hover:bg-foreground hover:text-primary-foreground disabled:opacity-40"
              >
                {t("admin.approve")}
              </button>
              <button
                onClick={() => onModerate(offering.id, "rejected")}
                disabled={loading}
                className="rounded-full border border-destructive/45 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.12em] font-mono-light text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-40"
              >
                {t("admin.reject")}
              </button>
            </>
          )}

          {statusFilter === "approved" && (
            <button
              onClick={() => onModerate(offering.id, "hidden")}
              disabled={loading}
              className="rounded-full border border-border px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.12em] font-mono-light text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-40"
            >
              {t("admin.hide")}
            </button>
          )}

          {statusFilter === "hidden" && (
            <button
              onClick={() => onModerate(offering.id, "approved")}
              disabled={loading}
              className="rounded-full border border-foreground/30 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.12em] font-mono-light hover:bg-foreground hover:text-primary-foreground disabled:opacity-40"
            >
              {t("admin.restore")}
            </button>
          )}

          <Link
            to={`/admin/o/${offering.id}`}
            className="rounded-full px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.12em] font-mono-light text-muted-foreground hover:text-foreground"
          >
            {t("admin.details")}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default AnticameraOfferingRow;
