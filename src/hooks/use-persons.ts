import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Person } from '@/types';

export const PERSONS_QUERY_KEY = ['persons'];

// 1. Fetch all persons / owners
export function usePersons() {
  return useQuery<Person[]>({
    queryKey: PERSONS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get('/persons');
      return response.data;
    },
  });
}

// 2. Create person / owner mutation
export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; phone?: string; email?: string; qidNumber?: string; notes?: string }) => {
      const response = await apiClient.post('/persons', data);
      return response.data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONS_QUERY_KEY });
    },
  });
}
