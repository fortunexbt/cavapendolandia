import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { visitorMessagesRepo } from "../api/visitorMessages.repo";
import { toast } from "sonner";

export type VisitorMessagesToastMessages = {
  markAsReadError: string;
  markAllAsReadSuccess: string;
  markAllAsReadError: string;
  deleteSuccess: string;
  deleteError: string;
};

const DEFAULT_MESSAGES: VisitorMessagesToastMessages = {
  markAsReadError: "Errore durante la marcatura come letto",
  markAllAsReadSuccess: "Tutti i messaggi segnati come letti",
  markAllAsReadError: "Errore",
  deleteSuccess: "Messaggio eliminato",
  deleteError: "Errore durante l'eliminazione",
};

export const useVisitorMessages = (toastMessages: Partial<VisitorMessagesToastMessages> = {}) => {
  const queryClient = useQueryClient();
  const msgs = { ...DEFAULT_MESSAGES, ...toastMessages };

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
    onError: () => toast.error(msgs.markAsReadError),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => visitorMessagesRepo.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor-messages"] });
      toast.success(msgs.markAllAsReadSuccess);
    },
    onError: () => toast.error(msgs.markAllAsReadError),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => visitorMessagesRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor-messages"] });
      toast.success(msgs.deleteSuccess);
    },
    onError: () => toast.error(msgs.deleteError),
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
