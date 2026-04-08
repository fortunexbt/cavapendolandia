import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { visitorMessagesRepo } from "../api/visitorMessages.repo";
import { toast } from "sonner";

export const useVisitorMessages = () => {
  const { t } = useTranslation();
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
    onError: () => toast.error(t("admin.messageMarkReadError")),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => visitorMessagesRepo.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor-messages"] });
      toast.success(t("admin.allMessagesMarkedRead"));
    },
    onError: () => toast.error(t("admin.allMessagesMarkReadError")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => visitorMessagesRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor-messages"] });
      toast.success(t("admin.messageDeleted"));
    },
    onError: () => toast.error(t("admin.messageDeleteError")),
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
