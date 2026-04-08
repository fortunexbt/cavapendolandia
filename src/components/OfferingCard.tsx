import { Link } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface OfferingCardProps {
  id: string;
  mediaType: string;
  fileUrl?: string | null;
  textContent?: string | null;
  linkUrl?: string | null;
  title?: string | null;
  note?: string | null;
  authorType: string;
  authorName?: string | null;
  createdAt: string;
  curatorialNote?: string | null;
  full?: boolean;
}

const OfferingCard = ({
  id,
  mediaType,
  fileUrl,
  textContent,
  linkUrl,
  title,
  note,
  authorType,
  authorName,
  createdAt,
  curatorialNote,
  full = false,
}: OfferingCardProps) => {
  const { t } = useTranslation();
  const linkHost = (() => {
    if (!linkUrl) return "";
    try {
      return new URL(linkUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const safeAuthorName = (authorName || "").replace(/^@+/, "");

  const renderMedia = () => {
    switch (mediaType) {
      case "image":
        return fileUrl ? (
          <img
            src={fileUrl}
            alt={title || t("gallery.offeringLabel")}
            className="w-full max-h-[70vh] object-contain"
            loading="lazy"
          />
        ) : null;
      case "video":
        return fileUrl ? (
          <video controls className="w-full max-h-[70vh]" preload="metadata">
            <source src={fileUrl} />
          </video>
        ) : null;
      case "audio":
        return fileUrl ? (
          <div className="py-12">
            <audio controls className="w-full max-w-md mx-auto" preload="metadata">
              <source src={fileUrl} />
            </audio>
          </div>
        ) : null;
      case "text":
        return (
          <div className="py-8 px-4 max-w-lg mx-auto">
            <p className="text-lg md:text-xl leading-relaxed italic text-foreground/80 whitespace-pre-wrap">
              {textContent}
            </p>
          </div>
        );
      case "pdf":
        return fileUrl ? (
          <div className="py-8">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-light text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              {t("gallery.openPdf")} ↗
            </a>
          </div>
        ) : null;
      case "link":
        return (
          <div className="py-8 border border-border/40 px-4 max-w-lg mx-auto">
            <a
              href={linkUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono-light text-muted-foreground hover:text-foreground transition-colors break-all"
            >
              <span className="text-sm">{title || linkHost || t("gallery.openLink")}</span>
              <span className="block text-xs text-muted-foreground/50 mt-2">
                {linkHost || linkUrl} ↗
              </span>
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  const authorDisplay =
    authorType === "anonymous"
      ? t("gallery.anonimo")
      : authorType === "instagram"
        ? `@${safeAuthorName || t("gallery.anonimo")}`
        : authorName || t("gallery.anonimo");

  const content = (
    <div className={`text-center ${full ? "" : "cursor-pointer group"}`}>
      <div className={full ? "mb-10" : "mb-6"}>{renderMedia()}</div>

      {title && (
        <h2 className={`${full ? "text-2xl md:text-3xl mb-3" : "text-xl md:text-2xl mb-2"} font-light leading-tight`}>
          {title}
        </h2>
      )}
      {note && (
        <p className={`${full ? "text-base md:text-lg max-w-2xl" : "text-sm max-w-md"} text-muted-foreground mx-auto mb-3 italic leading-relaxed`}>
          {note}
        </p>
      )}
      {curatorialNote && (
        <p className="font-mono-light text-ritual italic mb-4 text-xs md:text-sm">
          "{curatorialNote}"
        </p>
      )}

      <div className="flex items-center justify-center gap-3 font-mono-light text-muted-foreground/55 text-[0.68rem] uppercase tracking-[0.12em]">
        <span>{authorDisplay}</span>
        <span>·</span>
        <time>{format(new Date(createdAt), "d MMM yyyy", { locale: it })}</time>
      </div>
    </div>
  );

  if (full) return content;

  return (
    <Link to={`/o/${id}`} className="block">
      {content}
    </Link>
  );
};

export default OfferingCard;
