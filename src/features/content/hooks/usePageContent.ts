import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { pageContentRepo } from "../api/pageContent.repo";
import { toast } from "sonner";

export const usePageContent = (slug: string, blockKey: string) => {
  const { t } = useTranslation();
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
      toast.success(t("admin.contentSaved"));
    },
    onError: () => toast.error(t("admin.contentSaveError")),
  });

  return {
    block,
    isLoading,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
};
