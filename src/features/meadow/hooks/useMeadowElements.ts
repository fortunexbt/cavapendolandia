import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { meadowElementsRepo } from "../api/meadowElements.repo";
import { toast } from "sonner";

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
      toast.success(t("admin.meadowElementCreated"));
    },
    onError: () => toast.error(t("admin.meadowElementCreateError")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof meadowElementsRepo.update>[1] }) =>
      meadowElementsRepo.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success(t("admin.meadowElementUpdated"));
    },
    onError: () => toast.error(t("admin.meadowElementUpdateError")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meadowElementsRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success(t("admin.meadowElementDeleted"));
    },
    onError: () => toast.error(t("admin.meadowElementDeleteError")),
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
