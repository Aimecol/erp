import { ApiResponse, PaginatedResponse } from '@/types';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public field?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request configuration interface
interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

// API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...requestConfig } = config;
    
    // Build URL with query parameters
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...requestConfig.headers,
    };

    try {
      const response = await fetch(url.toString(), {
        ...requestConfig,
        headers,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
        return response as unknown as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data.code,
          data.field,
          data.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

// Create default API client instance
export const api = new ApiClient();

// Utility functions for common API patterns
export const apiUtils = {
  // Helper for paginated requests
  getPaginated: <T>(
    endpoint: string,
    page: number = 1,
    pageSize: number = 20,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<T>> => {
    return api.get<PaginatedResponse<T>>(endpoint, {
      page,
      size: pageSize,
      ...filters,
    });
  },

  // Helper for search requests
  search: <T>(
    endpoint: string,
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<T>> => {
    return api.get<PaginatedResponse<T>>(endpoint, {
      search: query,
      page,
      size: pageSize,
    });
  },

  // Helper for bulk operations
  bulkOperation: <T>(
    endpoint: string,
    operation: string,
    ids: string[]
  ): Promise<ApiResponse<T>> => {
    return api.post<ApiResponse<T>>(endpoint, {
      operation,
      ids,
    });
  },
};

// Export types
export type { RequestConfig };
