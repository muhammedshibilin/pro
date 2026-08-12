import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Company } from '@/types';

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await apiClient.get('/companies');
      return response.data;
    },
  });
}

export function useCompany(id: string) {
  return useQuery<Company>({
    queryKey: ['companies', id],
    queryFn: async () => {
      const response = await apiClient.get(`/companies/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCompany: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
      const response = await apiClient.post('/companies', newCompany);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) => {
      const response = await apiClient.patch(`/companies/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', variables.id] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/companies/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
    },
  });
}
