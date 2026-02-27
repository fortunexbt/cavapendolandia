import { Link } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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
  const renderMedia = () => {
    switch (mediaType) {
      case "image":
        return fileUrl ? (
          <img
            src={fileUrl}
            alt={title || "Offerta"}
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
              Apri PDF ↗
            </a>
          </div>
        ) : null;
      case "link":
        return (
          <div className="py-8">
            <a
              href={linkUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-light text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors break-all"
            >
              {linkUrl} ↗
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  const authorDisplay =
    authorType === "anonymous"
      ? "Anonimo"
      : authorType === "instagram"
        ? `@${authorName}`
        : authorName || "Anonimo";

  const content = (
    <div className={`text-center ${full ? "" : "cursor-pointer group"}`}>
      <div className="mb-6">{renderMedia()}</div>

      {title && (
        <h2 className="text-xl md:text-2xl font-light mb-2">{title}</h2>
      )}
      {note && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-3 italic">
          {note}
        </p>
      )}
      {curatorialNote && (
        <p className="font-mono-light text-ritual italic mb-3">
          "{curatorialNote}"
        </p>
      )}

      <div className="flex items-center justify-center gap-3 font-mono-light text-muted-foreground/60">
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
