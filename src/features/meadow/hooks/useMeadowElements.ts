import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meadowElementsRepo } from "../api/meadowElements.repo";
import { toast } from "sonner";

export type MeadowToastMessages = {
  created: string;
  updated: string;
  deleted: string;
  createError: string;
  updateError: string;
  deleteError: string;
};

const DEFAULT_MESSAGES: MeadowToastMessages = {
  created: "Elemento creato",
  updated: "Elemento aggiornato",
  deleted: "Elemento eliminato",
  createError: "Errore durante la creazione",
  updateError: "Errore durante l'aggiornamento",
  deleteError: "Errore durante l'eliminazione",
};

export const useMeadowElements = (messages: Partial<MeadowToastMessages> = {}) => {
  const queryClient = useQueryClient();
  const msgs = { ...DEFAULT_MESSAGES, ...messages };

  const { data: elements = [], isLoading } = useQuery({
    queryKey: ["meadow-elements"],
    queryFn: () => meadowElementsRepo.listAll(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof meadowElementsRepo.create>[0]) =>
      meadowElementsRepo.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success(msgs.created);
    },
    onError: () => toast.error(msgs.createError),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof meadowElementsRepo.update>[1] }) =>
      meadowElementsRepo.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success(msgs.updated);
    },
    onError: () => toast.error(msgs.updateError),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meadowElementsRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meadow-elements"] });
      toast.success(msgs.deleted);
    },
    onError: () => toast.error(msgs.deleteError),
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
