import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../utils/api';

export interface Vehicle {
  id: number;
  establishmentId: number;
  user_id: number | null;
  companyId: number | null;
  plate: string;
  model: string;
  color: string;
  price: number;
  price_formatted: string;
  discount: number;
  discount_formatted: string | null;
  created_at_formatted: string;
  created_at: string;
  services: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  company: {
    id: number;
    name: string;
  } | null;
}

export interface FetchVehiclesParams {
  establishmentId?: number;
  page?: number;
  limitPerPage?: number;
  model?: string;
  plate?: string;
  price?: number;
  date?: string;
  companyId?: number | null;
  withCompany?: number;
}

export interface PaginatedVehiclesResponse {
  data: Vehicle[];
  current_page: number;
  last_page: number;
  total: number;
}

const fetchVehicles = async (params: FetchVehiclesParams): Promise<PaginatedVehiclesResponse> => {
  console.log('[fetchVehicles] Fetching vehicles with params:', params);
  const response = await api.get(`/user/vehicle/list`, {
    params: {
      ...params,
      limitPerPage: params.limitPerPage || 10,
      page: params.page || 1,
    },
  });
  
  const root = response.data;
  
  let vehicles: Vehicle[] = [];
  let current_page = 1;
  let last_page = 1;
  let total = 0;
  
  const payload = root?.data || root;
  
  if (payload) {
    if (Array.isArray(payload)) {
      vehicles = payload;
    } else if (Array.isArray(payload.data)) {
      vehicles = payload.data;
      current_page = payload.current_page || 1;
      last_page = payload.last_page || 1;
      total = payload.total || vehicles.length;
    } else if (payload.data && Array.isArray(payload.data.data)) {
      vehicles = payload.data.data;
      current_page = payload.data.current_page || 1;
      last_page = payload.data.last_page || 1;
      total = payload.data.total || vehicles.length;
    } else if (payload.data && payload.data.data && Array.isArray(payload.data.data.data)) {
      vehicles = payload.data.data.data;
      current_page = payload.data.data.current_page || 1;
      last_page = payload.data.data.last_page || 1;
      total = payload.data.data.total || vehicles.length;
    }
  }

  console.log('[fetchVehicles] Parsed vehicle array length:', vehicles.length);
  return { data: vehicles, current_page, last_page, total };
};

export const useVehicles = (params: Omit<FetchVehiclesParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['vehicles', params],
    queryFn: ({ pageParam = 1 }) => fetchVehicles({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!params.establishmentId,
    staleTime: 2 * 60 * 1000,
  });
};
