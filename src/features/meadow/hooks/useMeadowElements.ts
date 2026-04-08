import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meadowElementsRepo } from "../api/meadowElements.repo";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useMeadowElements = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: elements = [], isLoading } = useQuery({
    queryKey: ["meadow-elements"],
    queryFn: () => meadowElementsRepo.listAll(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof meadowElementsRepo.create>[0]) =>
      meadowElementsRepo.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success(t("prato.elementCreated"));
    },
    onError: () => toast.error(t("prato.elementCreateError")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof meadowElementsRepo.update>[1] }) =>
      meadowElementsRepo.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success(t("prato.elementUpdated"));
    },
    onError: () => toast.error(t("prato.elementUpdateError")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meadowElementsRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success(t("prato.elementDeleted"));
    },
    onError: () => toast.error(t("prato.elementDeleteError")),
  });

  return {
    elements,
    isLoading,
    createElement: createMutation.mutate,
    updateElement: updateMutation.mutate,
    deleteElement: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
