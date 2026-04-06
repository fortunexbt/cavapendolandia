import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { visitorMessagesRepo } from "../api/visitorMessages.repo";
import { toast } from "sonner";

export const useVisitorMessages = () => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["visitor-messages"],
    queryFn: () => visitorMessagesRepo.list(),
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => visitorMessagesRepo.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor-messages"] });
    },
    onError: () => toast.error("Errore durante la marcatura come letto"),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => visitorMessagesRepo.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor-messages"] });
      toast.success("Tutti i messaggi segnati come letti");
    },
    onError: () => toast.error("Errore"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => visitorMessagesRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor-messages"] });
      toast.success("Messaggio eliminato");
    },
    onError: () => toast.error("Errore durante l'eliminazione"),
  });

  return {
    messages,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteMessage: deleteMutation.mutate,
    isMarking: markAsReadMutation.isPending,
    isMarkingAll: markAllAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
