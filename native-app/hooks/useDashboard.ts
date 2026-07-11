import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export interface DashboardProps {
  establishment_id: string;
  dateStart: string;
  dateEnd: string;
}

export interface MonthlyData {
  month_number: string;
  month: string;
  total_vehicle: number;
  total_price: string;
}

export interface VehicleData {
  total_vehicles: number;
  total_vehicles_invoiced: number;
  monthly_stats: MonthlyData[];
}

export interface CompanyData {
  total_companies: number;
  total_vehicles: number;
  total_vehicles_invoiced: number;
  monthly_stats: MonthlyData[];
}

export interface DashboardData {
  vehicle: VehicleData;
  company: CompanyData;
  total_vehicles: number;
  total_invoice: number;
  total_net: number;
  total_discount: number;
}

const fetchDashboardData = async (params: DashboardProps): Promise<DashboardData | null> => {
  const response = await api.get('/user/dashboard', { params });
  return response.data?.data || null;
};

export const useDashboardMetrics = (params: DashboardProps) => {
  return useQuery({
    queryKey: ['dashboard', params.establishment_id, params.dateStart, params.dateEnd],
    queryFn: () => fetchDashboardData(params),
    enabled: !!params.establishment_id && !!params.dateStart && !!params.dateEnd,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
