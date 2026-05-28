import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export interface BackendEstablishment {
  id: number;
  user_id: number;
  name_by_company: string;
  document: string;
  type: string;
  cor_system: string;
  active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const fetchEstablishments = async (): Promise<BackendEstablishment[]> => {
  const response = await api.get('/user/establishment/list-establishment-user');
  const dataPayload = response.data?.data;
  
  if (Array.isArray(dataPayload)) {
    return dataPayload;
  }
  
  if (dataPayload?.data && Array.isArray(dataPayload.data)) {
    return dataPayload.data;
  }
  
  if (dataPayload?.data?.data && Array.isArray(dataPayload.data.data)) {
    return dataPayload.data.data;
  }

  return [];
};

export const useEstablishments = () => {
  return useQuery<BackendEstablishment[]>({
    queryKey: ['establishments'],
    queryFn: fetchEstablishments,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export default useEstablishments;
