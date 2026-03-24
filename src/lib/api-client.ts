import type { ApiClientConfig, ApiError } from "../types/auth";

class ApiClient {
	private baseURL: string;
	private defaultHeaders: Record<string, string>;
	private onUnauthorized?: () => void;

	constructor(config: ApiClientConfig) {
		this.baseURL = config.baseURL;
		this.defaultHeaders = {
			"Content-Type": "application/json",
			...config.headers,
		};
		this.onUnauthorized = config.onUnauthorized;
	}

	private getToken(): string | null {
		if (typeof window !== "undefined") {
			const localToken = localStorage.getItem("auth_token");
			if (localToken) return localToken;

			const sessionToken = sessionStorage.getItem("auth_token");
			if (sessionToken) return sessionToken;
		}
		return null;
	}

	private getHeaders(): HeadersInit {
		const headers: HeadersInit = {
			...this.defaultHeaders,
		};

		const token = this.getToken();
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		return headers;
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			// Handle 401 Unauthorized

			if (response.status === 401) {
				if (typeof window !== "undefined") {
					localStorage.removeItem("auth_token");
					sessionStorage.removeItem("auth_token");
				}

				this.onUnauthorized?.();

				const error: ApiError = new Error("Unauthorized access");
				error.status = 401;
				error.name = "ApiError";

				throw error;
			}

			let errorData: unknown;
			let message = `Request failed with status ${response.status}`;

			try {
				const text = await response.text(); // read ONCE

				if (text) {
					try {
						const json = JSON.parse(text);
						errorData = json;
						if (json?.message) message = json.message;
					} catch {
						errorData = text;
					}
				}
			} catch {
				errorData = `Request failed with status ${response.status}`;
			}

			const error: ApiError = new Error(message);
			error.status = response.status;
			error.data = errorData;
			error.name = "ApiError";
			throw error;
		}

		// Handle empty responses
		if (response.status === 204) {
			return {} as T;
		}

		return response.json();
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const headers = this.getHeaders();

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					...headers,
					...options.headers,
				},
			});

			return this.handleResponse<T>(response);
		} catch (error) {
			// Check if it's a network error
			if (error instanceof TypeError && error.message === "Failed to fetch") {
				const networkError: ApiError = new Error(
					"Network error - please check your connection",
				);
				networkError.isNetworkError = true;
				networkError.name = "ApiError";
				throw networkError;
			}

			// Re-throw if it's already an ApiError
			if ((error as ApiError).name === "ApiError") {
				throw error;
			}

			// Wrap unknown errors
			const wrappedError: ApiError = new Error(
				error instanceof Error ? error.message : "Unknown error occurred",
			);
			wrappedError.name = "ApiError";
			throw wrappedError;
		}
	}

	async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "GET" });
	}

	async post<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestInit,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async put<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestInit,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async patch<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestInit,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "DELETE" });
	}

	setTokenStorage(storage: "localStorage" | "sessionStorage" | "cookie") {
		console.log(`Token storage set to ${storage}`);
	}
}

let apiClientInstance: ApiClient | null = null;

export function createApiClient(config: ApiClientConfig): ApiClient {
	apiClientInstance = new ApiClient(config);
	return apiClientInstance;
}

export function getApiClient(): ApiClient {
	if (!apiClientInstance) {
		throw new Error("API client not initialized. Call createApiClient first.");
	}
	return apiClientInstance;
}

// Vite environment variable
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const apiClient = createApiClient({
	baseURL: API_URL,
	onUnauthorized: () => {
		window.location.href = "/login";
	},
});
