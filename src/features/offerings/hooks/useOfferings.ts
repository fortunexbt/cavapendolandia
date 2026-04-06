import { useQuery } from "@tanstack/react-query";
import {
  getApprovedOfferings,
  getOfferingById,
  type OfferingRow,
} from "../api/offerings.repo";

export const useApprovedOfferings = () => {
  return useQuery<OfferingRow[], Error>({
    queryKey: ["offerings", "approved"],
    queryFn: getApprovedOfferings,
    staleTime: 1000 * 60 * 5,
  });
};

export const useOffering = (id: string | undefined) => {
  return useQuery<OfferingRow | null, Error>({
    queryKey: ["offerings", id],
    queryFn: () => {
      if (!id) return Promise.resolve(null);
      return getOfferingById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
