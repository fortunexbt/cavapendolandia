import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { initiativesRepo } from "../api/initiatives.repo";
import { toast } from "sonner";

export type InitiativesToastMessages = {
  createSuccess: string;
  createError: string;
  updateSuccess: string;
  updateError: string;
  deleteSuccess: string;
  deleteError: string;
};

const DEFAULT_MESSAGES: InitiativesToastMessages = {
  createSuccess: "Iniziativa pubblicata",
  createError: "Impossibile pubblicare l'iniziativa",
  updateSuccess: "Iniziativa aggiornata",
  updateError: "Errore durante l'aggiornamento",
  deleteSuccess: "Iniziativa eliminata",
  deleteError: "Errore durante l'eliminazione",
};

export const useInitiatives = (messages: Partial<InitiativesToastMessages> = {}) => {
  const queryClient = useQueryClient();
  const msgs = { ...DEFAULT_MESSAGES, ...messages };

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
      toast.success(msgs.createSuccess);
    },
    onError: () => toast.error(msgs.createError),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof initiativesRepo.update>[1] }) =>
      initiativesRepo.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-initiatives"] });
      queryClient.invalidateQueries({ queryKey: ["active-initiative"] });
      toast.success(msgs.updateSuccess);
    },
    onError: () => toast.error(msgs.updateError),
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
      toast.success(msgs.deleteSuccess);
    },
    onError: () => toast.error(msgs.deleteError),
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
