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

export const usePageContent = (
  slug: string,
  blockKey: string,
  messages: Partial<PageContentToastMessages> = {},
) => {
  const queryClient = useQueryClient();
  const msgs = { ...DEFAULT_MESSAGES, ...messages };

  const { data: block, isLoading } = useQuery({
    queryKey: ["page-content", slug, blockKey],
    queryFn: () => pageContentRepo.get(slug, blockKey),
    enabled: !!slug && !!blockKey,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { title?: string; body?: string }) =>
      pageContentRepo.upsert(slug, blockKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content", slug, blockKey] });
      toast.success(msgs.saveSuccess);
    },
    onError: () => toast.error(msgs.saveError),
  });

  return {
    block,
    isLoading,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
};
