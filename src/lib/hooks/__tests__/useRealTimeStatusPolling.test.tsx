import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRealTimeStatusPolling } from "../useRealTimeStatusPolling";
import * as adoptionService from "../../../api/adoptionService";
import * as custodyService from "../../../api/custodyService";
import type { AdoptionDetails, CustodyDetails } from "../../../types/adoption";
import type { ReactNode } from "react";

// Helper to create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Wrapper component for React Query
function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Mock data
const mockAdoptionData: AdoptionDetails = {
  id: "adoption-1",
  status: "ESCROW_CREATED",
  petId: "pet-1",
  adopterId: "user-1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockCustodyData: CustodyDetails = {
  id: "custody-1",
  status: "CUSTODY_ACTIVE",
  petId: "pet-1",
  custodianId: "user-1",
  ownerId: "user-2",
  startDate: "2024-01-01T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("useRealTimeStatusPolling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("polls adoption details with custom interval", async () => {
    const queryClient = createTestQueryClient();
    const mockGetDetails = vi
      .spyOn(adoptionService.adoptionService, "getDetails")
      .mockResolvedValue(mockAdoptionData);

    const { result } = renderHook(
      () => useRealTimeStatusPolling("adoption", "adoption-1", { intervalMs: 100 }),
      { wrapper: createWrapper(queryClient) }
    );

    // Initial fetch
    await waitFor(() => expect(mockGetDetails).toHaveBeenCalledTimes(1));
    expect(result.current.data).toEqual(mockAdoptionData);

    // Fast-forward 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should poll again
    await waitFor(() => expect(mockGetDetails).toHaveBeenCalledTimes(2));
  });

  it("polls custody details when entityType is custody", async () => {
    const queryClient = createTestQueryClient();
    const mockGetDetails = vi
      .spyOn(custodyService.custodyService, "getDetails")
      .mockResolvedValue(mockCustodyData);

    const { result } = renderHook(
      () => useRealTimeStatusPolling("custody", "custody-1", { intervalMs: 100 }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => expect(mockGetDetails).toHaveBeenCalledTimes(1));
    expect(mockGetDetails).toHaveBeenCalledWith("custody-1");
    expect(result.current.data).toEqual(mockCustodyData);
  });

  it("sets statusChanged to true for 3 seconds after status change", async () => {
    const queryClient = createTestQueryClient();
    vi
      .spyOn(adoptionService.adoptionService, "getDetails")
      .mockResolvedValueOnce(mockAdoptionData)
      .mockResolvedValueOnce({
        ...mockAdoptionData,
        status: "ESCROW_FUNDED",
      });

    const { result } = renderHook(
      () => useRealTimeStatusPolling("adoption", "adoption-1", { intervalMs: 100 }),
      { wrapper: createWrapper(queryClient) }
    );

    // Initial state - no status change
    await waitFor(() => expect(result.current.statusChanged).toBe(false));

    // Trigger status change
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Status should have changed
    await waitFor(() => expect(result.current.statusChanged).toBe(true));

    // After 2 seconds, still true
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.statusChanged).toBe(true);

    // After 3 seconds total, should be false
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.statusChanged).toBe(false);
  });

  it("stops polling when status is COMPLETED", async () => {
    const queryClient = createTestQueryClient();
    const mockGetDetails = vi
      .spyOn(adoptionService.adoptionService, "getDetails")
      .mockResolvedValueOnce(mockAdoptionData)
      .mockResolvedValueOnce({
        ...mockAdoptionData,
        status: "COMPLETED",
      });

    renderHook(
      () => useRealTimeStatusPolling("adoption", "adoption-1", { intervalMs: 100 }),
      { wrapper: createWrapper(queryClient) }
    );

    // Initial fetch
    await waitFor(() => expect(mockGetDetails).toHaveBeenCalledTimes(1));

    // Status changes to COMPLETED
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => expect(mockGetDetails).toHaveBeenCalledTimes(2));

    // Fast-forward another 100ms - should not poll again
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still be 2 calls (polling stopped)
    expect(mockGetDetails).toHaveBeenCalledTimes(2);
  });

  it("stops polling when status is CANCELLED", async () => {
    const queryClient = createTestQueryClient();
    const mockGetDetails = vi
      .spyOn(adoptionService.adoptionService, "getDetails")
      .mockResolvedValueOnce(mockAdoptionData)
      .mockResolvedValueOnce({
        ...mockAdoptionData,
        status: "CANCELLED",
      });

    renderHook(
      () => useRealTimeStatusPolling("adoption", "adoption-1", { intervalMs: 100 }),
      { wrapper: createWrapper(queryClient) }
    );

    // Initial fetch
    await waitFor(() => expect(mockGetDetails).toHaveBeenCalledTimes(1));

    // Status changes to CANCELLED
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => expect(mockGetDetails).toHaveBeenCalledTimes(2));

    // Fast-forward another 100ms - should not poll again
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still be 2 calls (polling stopped)
    expect(mockGetDetails).toHaveBeenCalledTimes(2);
  });

  it("throws error for unsupported entity type", () => {
    const queryClient = createTestQueryClient();

    expect(() => {
      renderHook(
        // @ts-expect-error - Testing invalid entity type
        () => useRealTimeStatusPolling("invalid", "id-1"),
        { wrapper: createWrapper(queryClient) }
      );
    }).toThrow("Unsupported entity type: invalid");
  });

  it("returns correct data structure", async () => {
    const queryClient = createTestQueryClient();
    vi
      .spyOn(adoptionService.adoptionService, "getDetails")
      .mockResolvedValue(mockAdoptionData);

    const { result } = renderHook(
      () => useRealTimeStatusPolling("adoption", "adoption-1", { intervalMs: 100 }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockAdoptionData);
      expect(result.current.statusChanged).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
