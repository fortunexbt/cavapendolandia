import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pageContentRepo } from "../api/pageContent.repo";
import { toast } from "sonner";

export const usePageContent = (slug: string, blockKey: string) => {
  const queryClient = useQueryClient();

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
      toast.success("Contenuto salvato");
    },
    onError: () => toast.error("Errore durante il salvataggio"),
  });

  return {
    block,
    isLoading,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
};
