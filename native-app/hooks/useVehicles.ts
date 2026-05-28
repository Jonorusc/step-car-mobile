import { useQuery } from '@tanstack/react-query';
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

const fetchVehicles = async (establishmentId: number): Promise<Vehicle[]> => {
  console.log('[fetchVehicles] Fetching vehicles for establishmentId:', establishmentId);
  const response = await api.get(`/user/vehicle/list`, {
    params: { establishmentId, withCompany: 1 },
  });
  
  const root = response.data;
  console.log('[fetchVehicles] Raw response root data:', JSON.stringify(root));
  
  let result: Vehicle[] = [];
  if (root) {
    if (Array.isArray(root)) {
      result = root;
    } else if (Array.isArray(root.data)) {
      result = root.data;
    } else if (root.data && Array.isArray(root.data.data)) {
      result = root.data.data;
    } else if (root.data && root.data.data && Array.isArray(root.data.data.data)) {
      result = root.data.data.data;
    }
  }

  console.log('[fetchVehicles] Parsed vehicle array length:', result.length);
  return result;
};

export const useVehicles = (establishmentId: number | undefined) => {
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles', establishmentId],
    queryFn: () => fetchVehicles(establishmentId!),
    enabled: !!establishmentId,
    staleTime: 2 * 60 * 1000,
  });
};
