import { FERN_API_BASE_URL, getAuthHeaders2 } from "@/config/fern/config";
import { FernApiError } from "../types/fern.types";

/**
 * HTTP request helper for Fern API with consistent error handling
 */
export const fernApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(`${FERN_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders2(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: response.statusText 
      }));
      
      const error = new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      ) as FernApiError;
      error.status = response.status;
      error.details = errorData;
      throw error;
    }

    return await response.json();
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw new Error(`Fern API request failed: ${error.message}`);
  }
};