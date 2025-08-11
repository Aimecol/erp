import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiUtils } from '@/lib/api';
import { BusinessPartner, PaginatedResponse } from '@/types';

// Query keys
export const businessPartnerKeys = {
  all: ['business-partners'] as const,
  lists: () => [...businessPartnerKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...businessPartnerKeys.lists(), filters] as const,
  details: () => [...businessPartnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...businessPartnerKeys.details(), id] as const,
};

// Hooks
export function useBusinessPartners(
  page: number = 1,
  pageSize: number = 20,
  filters: Record<string, any> = {}
) {
  return useQuery({
    queryKey: businessPartnerKeys.list({ page, pageSize, ...filters }),
    queryFn: () => apiUtils.getPaginated<BusinessPartner>('/v1/business-partners', page, pageSize, filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useBusinessPartner(id: string) {
  return useQuery({
    queryKey: businessPartnerKeys.detail(id),
    queryFn: () => api.get<BusinessPartner>(`/v1/business-partners/${id}`),
    enabled: !!id,
  });
}

export function useCreateBusinessPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<BusinessPartner>) => 
      api.post<BusinessPartner>('/v1/business-partners', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessPartnerKeys.lists() });
    },
  });
}

export function useUpdateBusinessPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusinessPartner> }) =>
      api.put<BusinessPartner>(`/v1/business-partners/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: businessPartnerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: businessPartnerKeys.lists() });
    },
  });
}

export function useDeleteBusinessPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/business-partners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessPartnerKeys.lists() });
    },
  });
}

export function useSearchBusinessPartners(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...businessPartnerKeys.lists(), 'search', query],
    queryFn: () => apiUtils.search<BusinessPartner>('/v1/business-partners', query),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}
