import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface CompanyAddress {
  postal_code: string;
  street: string;
  neighborhood: string;
  state: string;
  city: string;
  number: string;
  complement?: string;
}

export interface Company {
  id: number;
  establishment_id: number;
  company_name: string;
  fantasy_name: string;
  document: string;
  phone: string;
  email: string;
  closing_date: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  address?: CompanyAddress;
}

export interface ListCompanyResponse {
  current_page: number;
  data: Company[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface CreateCompanyPayload {
  establishmentId: number;
  companyName: string;
  fantasyName: string;
  document: string;
  phone: string;
  email: string;
  closingDate: number;
  address: {
    postalcode: string;
    street: string;
    neighborhood: string;
    state: string;
    city: string;
    number: string;
    complement?: string;
  };
}

export interface UpdateCompanyPayload extends CreateCompanyPayload {
  id: number;
}

export interface DownloadReportPayload {
  establishment_id: number;
  company_id: number;
  date_start: string;
  date_end: string;
  company_name: string;
}

export const fetchCompanies = async (
  establishmentId: number,
  companyName: string | null,
  page: number,
): Promise<ListCompanyResponse> => {
  const { data } = await api.get('/user/company/list', {
    params: { 
      establishmentId, 
      companyName, 
      page 
    },
  });
  
  return data?.data || data; 
};

export const useCompanyList = (establishmentId: number, companyName: string | null) => {
  return useInfiniteQuery({
    queryKey: ['companies', establishmentId, companyName],
    queryFn: ({ pageParam = 1 }) => fetchCompanies(establishmentId, companyName, pageParam as number),
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

export const useCreateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCompanyPayload) => {
      const { data } = await api.post('/user/company/create', payload);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useUpdateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateCompanyPayload) => {
      const { data } = await api.put('/user/company/update', payload);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useDeleteCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/user/company/delete/${id}`);
      return data;
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: async ({ establishment_id, company_id, date_start, date_end, company_name }: DownloadReportPayload) => {
      // For React Native we use arraybuffer to receive binary data properly from axios
      const response = await api.post('/user/report', {
        establishment_id,
        company_id,
        date_start,
        date_end
      }, {
        responseType: 'arraybuffer'
      });

      // Convert arraybuffer to base64
      let binary = '';
      const bytes = new Uint8Array(response.data);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      
      // Standard base64 polyfill isn't always reliable in hermes, but btoa usually is, or we can use a small manual function.
      // However, react-native has an issue with large btoa calls. A safer approach for expo is using FileReader if it was a blob, 
      // but arraybuffer can be converted safely. Actually, Axios handles base64 if configured properly, but let's do this:
      const base64PDF = btoa(binary);

      const fileName = `relatorio-${company_name.replace(/[^a-zA-Z0-9]/g, '')}-${date_start}-${date_end}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, base64PDF, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Relatório da Empresa'
        });
      }
      
      return fileUri;
    },
  });
};
