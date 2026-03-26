import { useState, useEffect, useRef } from "react";
import { usePolling } from "./usePolling";
import { adoptionService } from "../../api/adoptionService";
import { custodyService } from "../../api/custodyService";
import type { AdoptionDetails, CustodyDetails } from "../../types/adoption";

type EntityType = "adoption" | "custody";

export interface UseRealTimeStatusPollingOptions {
  intervalMs?: number;
}

export function useRealTimeStatusPolling(
  entityType: EntityType,
  entityId: string,
  options: UseRealTimeStatusPollingOptions = {},
) {
  const { intervalMs = 15000 } = options;
  const [statusChanged, setStatusChanged] = useState(false);
  const previousStatusRef = useRef<string | undefined>(undefined);

  // Determine the fetch function based on entity type
  const fetchFn = (): Promise<AdoptionDetails | CustodyDetails> => {
    switch (entityType) {
      case "adoption":
        return adoptionService.getDetails(entityId);
      case "custody":
        return custodyService.getDetails(entityId);
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  };

  // Determine if polling should stop based on terminal statuses
  const stopWhen = (data: AdoptionDetails | CustodyDetails | undefined) => {
    if (!data) return false;
    return data.status === "COMPLETED" || data.status === "CANCELLED";
  };

  const query = usePolling([entityType, entityId], fetchFn, {
    intervalMs,
    stopWhen,
  });

  // Track status changes and trigger pulse animation
  useEffect(() => {
    const currentStatus = query.data?.status;

    if (currentStatus && previousStatusRef.current !== currentStatus) {
      // Status has changed
      setStatusChanged(true);

      // Reset after 3 seconds
      const timer = setTimeout(() => {
        setStatusChanged(false);
      }, 3000);

      // Update previous status
      previousStatusRef.current = currentStatus;

      return () => clearTimeout(timer);
    }
  }, [query.data?.status]);

  return {
    data: query.data,
    statusChanged,
    isLoading: query.isLoading,
  };
}
