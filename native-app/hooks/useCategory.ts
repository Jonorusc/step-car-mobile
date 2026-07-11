import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export interface Category {
  id: number;
  establishment_id: number;
  name: string;
  description?: string | null;
  number_icon: number;
  active: number;
}

export interface ListCategoryResponse {
  current_page: number;
  data: Category[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export const fetchCategories = async (
  establishmentId: number,
  name: string | null,
  page: number,
): Promise<ListCategoryResponse> => {
  const { data } = await api.get('/user/category/list', {
    params: { establishmentId, name, page },
  });
  
  // Handles potential response wrappers
  const payload = data?.data || data; 
  return payload;
};

export const useCategoryList = (establishmentId: number, name: string | null) => {
  return useInfiniteQuery({
    queryKey: ['categories', establishmentId, name],
    queryFn: ({ pageParam = 1 }) => fetchCategories(establishmentId, name, pageParam as number),
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

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { establishmentId: number; name: string; description?: string; numberIcon: number }) => {
      const { data } = await api.post('/user/category/create', payload);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number; name: string; description?: string; numberIcon: number }) => {
      const { data } = await api.put('/user/category/update', payload);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/user/category/delete/${id}`);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['categories'] });
        qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
