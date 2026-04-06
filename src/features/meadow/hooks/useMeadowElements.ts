import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meadowElementsRepo } from "../api/meadowElements.repo";
import { toast } from "sonner";

export const useMeadowElements = () => {
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
      toast.success("Elemento creato");
    },
    onError: () => toast.error("Errore durante la creazione"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof meadowElementsRepo.update>[1] }) =>
      meadowElementsRepo.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success("Elemento aggiornato");
    },
    onError: () => toast.error("Errore durante l'aggiornamento"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meadowElementsRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success("Elemento eliminato");
    },
    onError: () => toast.error("Errore durante l'eliminazione"),
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
