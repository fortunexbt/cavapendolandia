import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { initiativesRepo } from "../api/initiatives.repo";
import { toast } from "sonner";

export const useInitiatives = () => {
  const queryClient = useQueryClient();

  const { data: initiatives = [], isLoading } = useQuery({
    queryKey: ["admin-initiatives"],
    queryFn: () => initiativesRepo.listAll(),
  });

  const { data: activeInitiative } = useQuery({
    queryKey: ["active-initiative"],
    queryFn: () => initiativesRepo.getActive(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { prompt: string; details?: string; created_by?: string }) =>
      initiativesRepo.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-initiatives"] });
      queryClient.invalidateQueries({ queryKey: ["active-initiative"] });
      toast.success("Iniziativa pubblicata");
    },
    onError: () => toast.error("Impossibile pubblicare l'iniziativa"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof initiativesRepo.update>[1] }) =>
      initiativesRepo.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-initiatives"] });
      queryClient.invalidateQueries({ queryKey: ["active-initiative"] });
      toast.success("Iniziativa aggiornata");
    },
    onError: () => toast.error("Errore durante l'aggiornamento"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      initiativesRepo.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-initiatives"] });
      queryClient.invalidateQueries({ queryKey: ["active-initiative"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => initiativesRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-initiatives"] });
      queryClient.invalidateQueries({ queryKey: ["active-initiative"] });
      toast.success("Iniziativa eliminata");
    },
    onError: () => toast.error("Errore durante l'eliminazione"),
  });

  return {
    initiatives,
    activeInitiative,
    isLoading,
    createInitiative: createMutation.mutate,
    updateInitiative: updateMutation.mutate,
    toggleInitiative: toggleMutation.mutate,
    deleteInitiative: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isToggling: toggleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
