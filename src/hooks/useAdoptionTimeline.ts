import { useApiQuery } from "./useApiQuery";
import { adoptionService } from "../api/adoptionService";
import type { TimelineEntry } from "../types/adoption";

export function useAdoptionTimeline(adoptionId: string) {
  const { data, isLoading, isError } = useApiQuery<TimelineEntry[]>(
    ["adoption", adoptionId, "timeline"],
    () => adoptionService.getTimeline(adoptionId)
  );

  return {
    entries: data ?? [],
    isLoading,
    isError,
  };
}
