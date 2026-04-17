import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pageContentRepo } from "../api/pageContent.repo";
import { toast } from "sonner";

export type PageContentToastMessages = {
  saveSuccess: string;
  saveError: string;
};

const DEFAULT_MESSAGES: PageContentToastMessages = {
  saveSuccess: "Contenuto salvato",
  saveError: "Errore durante il salvataggio",
};

const DEFAULT_LOCALE = "it";

export const usePageContent = (
  slug: string,
  blockKey: string,
  messages: Partial<PageContentToastMessages> = {},
  locale: string = DEFAULT_LOCALE,
) => {
  const queryClient = useQueryClient();
  const msgs = { ...DEFAULT_MESSAGES, ...messages };

  const { data: block, isLoading } = useQuery({
    queryKey: ["page-content", slug, blockKey, locale],
    queryFn: () => pageContentRepo.get(slug, blockKey, locale),
    enabled: !!slug && !!blockKey,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { title?: string; body_text?: string }) =>
      pageContentRepo.upsert(slug, blockKey, { ...payload, locale }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content", slug, blockKey, locale] });
      queryClient.invalidateQueries({ queryKey: ["page-blocks", slug, locale] });
      queryClient.invalidateQueries({ queryKey: ["page-blocks", slug] });
      toast.success(msgs.saveSuccess);
    },
    onError: (err) => {
      console.error("[usePageContent] save error", err);
      toast.error(msgs.saveError);
    },
  });

  return {
    block,
    isLoading,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
};
