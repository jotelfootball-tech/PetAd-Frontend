import { apiClient } from "../lib/api-client";
import type { AdoptionTimelineEntry, AdoptionDetails } from "../types/adoption";

export interface AdoptionRating {
  rating: number;
  feedback: string;
  adoptionId?: string;
  petId?: string;
}

export const adoptionService = {
  async getDetails(adoptionId: string): Promise<AdoptionDetails> {
    return apiClient.get(`/adoption/${adoptionId}`);
  },

  async submitRating(ratingData: AdoptionRating): Promise<void> {
    // TODO: Replace with actual API endpoint
    console.log("Submitting rating:", ratingData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful submission
    return Promise.resolve();
  },

  async completeAdoption(adoptionId: string): Promise<void> {
    return apiClient.post(`/adoption/${adoptionId}/complete`);
  },

  async getTimeline(adoptionId: string): Promise<AdoptionTimelineEntry[]> {
    return apiClient.get(`/adoption/${adoptionId}/timeline`);
  },
};
