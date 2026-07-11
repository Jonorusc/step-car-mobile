import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export interface Service {
  id: number;
  establishment_id: number;
  category_id: number;
  name: string;
  description: string | null;
  nameCategory: string;
  price: number;
  active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ListServiceResponse {
  current_page: number;
  data: Service[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export const fetchServices = async (
  establishmentId: number,
  categoryIds: number[],
  name: string | null,
  page: number,
): Promise<ListServiceResponse> => {
  const { data } = await api.get('/user/service/list', {
    params: { 
      establishmentId, 
      categoryIds: categoryIds.join(','),
      name, 
      page 
    },
  });
  
  // Handling wrapper variations (data.data vs data)
  const payload = data?.data || data; 
  return payload;
};

export const useServiceList = (establishmentId: number, categoryIds: number[], name: string | null) => {
  return useInfiniteQuery({
    queryKey: ['services', establishmentId, categoryIds, name],
    queryFn: ({ pageParam = 1 }) => fetchServices(establishmentId, categoryIds, name, pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!establishmentId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { establishmentId: number; categoryId: number; name: string; description?: string; price: number }) => {
      const { data } = await api.post('/user/service/create', payload);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number; establishmentId: number; name: string; description?: string; price: number }) => {
      // In web app it expects idService inside payload but the endpoint uses `id`. I'll send both to be safe based on the edit hook seen in web: { id: idService, establishmentId... }
      const { data } = await api.put('/user/service/update', payload);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/user/service/delete/${id}`);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
