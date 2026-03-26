import { http, HttpResponse, delay } from "msw";
import type { AdoptionTimelineEntry } from "../../types/adoption";

const MOCK_TIMELINE: AdoptionTimelineEntry[] = [
  {
    id: "1",
    adoptionId: "adoption-1",
    timestamp: "2026-03-25T10:00:00Z",
    sdkEvent: "ESCROW_CREATED",
    message: "Escrow account created.",
    actor: "system",
  },
  {
    id: "2",
    adoptionId: "adoption-1",
    timestamp: "2026-03-25T10:05:00Z",
    sdkEvent: "PET_INFO_UPDATED",
    message: "Pet information updated.",
    actor: "vet",
  },
  {
    id: "3",
    adoptionId: "adoption-1",
    timestamp: "2026-03-25T10:10:00Z",
    sdkEvent: "ESCROW_FUNDED",
    message: "Escrow account funded.",
    actor: "buyer",
  },
  {
    id: "4",
    adoptionId: "adoption-1",
    timestamp: "2026-03-25T10:15:00Z",
    sdkEvent: "VISIT_SCHEDULED",
    message: "Home visit scheduled.",
    actor: "inspector",
  },
  {
    id: "5",
    adoptionId: "adoption-1",
    timestamp: "2026-03-25T10:20:00Z",
    sdkEvent: "ESCROW_SETTLEMENT_TRIGGERED",
    message: "Settlement triggered.",
    actor: "system",
  },
];

export const adoptionHandlers = [
  http.get("/api/adoption/:id/timeline", async () => {
    await delay(100);
    return HttpResponse.json(MOCK_TIMELINE);
  }),
];
