import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import OfferingCard from "@/components/OfferingCard";
import { motion } from "framer-motion";
import { withSignedFileUrl } from "@/lib/offeringMedia";
import EntraComingSoon from "@/components/EntraComingSoon";

const OfferingDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const { data: offering, isLoading } = useQuery({
    queryKey: ["offering", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select("*")
        .eq("id", id!)
        .eq("status", "approved")
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return withSignedFileUrl(data);
    },
    enabled: !!id,
  });

  const { data: randomOffering } = useQuery({
    queryKey: ["random-offering", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select("id")
        .eq("status", "approved")
        .neq("id", id!)
        .limit(50);
      if (error || !data?.length) return null;
      return data[Math.floor(Math.random() * data.length)];
    },
    enabled: !!id,
  });

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        {isLoading ? (
          <p className="font-mono-light text-muted-foreground/40 animate-pulse">{t("offeringDetail.loading")}</p>
        ) : !offering ? (
          <div className="text-center">
            <p className="text-lg italic text-muted-foreground/60 mb-4">{t("offeringDetail.notFound")}</p>
            <EntraComingSoon
              label={t("offeringDetail.backToArchive")}
              className="font-mono-light text-muted-foreground/45 underline underline-offset-4"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="ritual-container max-w-3xl"
          >
            <p className="ritual-label text-center mb-8">{t("offeringDetail.found")}</p>
            <OfferingCard
              id={offering.id}
              mediaType={offering.media_type}
              fileUrl={offering.file_url}
              textContent={offering.text_content}
              linkUrl={offering.link_url}
              title={offering.title || "Cavapendolata"}
              note={offering.note}
              authorType={offering.author_type}
              authorName={offering.author_name}
              createdAt={offering.created_at}
              curatorialNote={offering.curatorial_note}
              full
            />

            <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
              <button
                onClick={handleCopyLink}
                className="font-mono-light text-xs text-muted-foreground/65 hover:text-foreground transition-colors"
              >
                {copied ? t("offeringDetail.copied") : t("offeringDetail.copyLink")}
              </button>
              {randomOffering && (
                <Link
                  to={`/o/${randomOffering.id}`}
                  className="rounded-full border border-foreground/25 px-7 py-2 font-mono-light text-xs uppercase tracking-[0.13em] text-foreground/85 hover:bg-foreground hover:text-primary-foreground"
                >
                  {t("offeringDetail.another")}
                </Link>
              )}
              <EntraComingSoon
                label={t("offeringDetail.backToArchive")}
                className="font-mono-light text-xs text-muted-foreground/45"
              />
              <Link
                to="/offri"
                className="font-mono-light text-xs text-muted-foreground/65 hover:text-foreground transition-colors"
              >
                {t("offeringDetail.leaveOffering")}
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      <MinimalFooter />
    </div>
  );
};

export default OfferingDetail;
