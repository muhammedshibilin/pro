import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Document, DashboardStats } from '@/types';

export function useDocuments(filters?: { status?: string; type?: string; scope?: string }) {
  return useQuery<Document[]>({
    queryKey: ['documents', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.scope) params.append('scope', filters.scope);

      const response = await apiClient.get('/documents', { params });
      return response.data;
    },
  });
}

export function useDocument(id: string) {
  return useQuery<Document>({
    queryKey: ['documents', id],
    queryFn: async () => {
      const response = await apiClient.get(`/documents/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useDocumentStats() {
  return useQuery<DashboardStats>({
    queryKey: ['document-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/documents/stats');
      return response.data;
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newDoc: Omit<Document, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'employee'>) => {
      const response = await apiClient.post('/documents', newDoc);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Document> }) => {
      const response = await apiClient.patch(`/documents/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/documents/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useRecalculateDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/documents/recalculate');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
    },
  });
}
